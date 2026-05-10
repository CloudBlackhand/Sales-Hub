"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ActionResult, PaginatedResult } from "@/types";
import { Sale, SaleStatus, SaleType, CommissionType } from "@/lib/prisma-types";
import { saleSchema, type SaleInput } from "@/lib/schemas/sales";
import { trackOpenPanelSaleCreated, trackOpenPanelSaleStatusUpdated } from "@/lib/openpanel-server";
import { decimalToNumber } from "@/lib/decimal-json";
import { formatServerActionError } from "@/lib/demo-read-only";

/** Venda com Decimals convertidos para number (RSC, API e cliente). */
type SaleWithRelations = Omit<Sale, "totalAmount" | "discount"> & {
  totalAmount: number;
  discount: number;
  seller: { id: string; name: string; code: string };
  customer: { id: string; name: string } | null;
  items: Array<{
    id: string;
    description: string | null;
    quantity: number;
    unitPrice: number;
    discount: number;
    totalPrice: number;
    product: { id: string; name: string } | null;
  }>;
};

export async function getSales(
  companyId: string,
  params: {
    page?: number;
    perPage?: number;
    search?: string;
    status?: SaleStatus;
    sellerId?: string;
    type?: SaleType;
    from?: string;
    to?: string;
  } = {}
): Promise<PaginatedResult<SaleWithRelations>> {
  const { page = 1, perPage = 20, search, status, sellerId, type, from, to } = params;
  const skip = (page - 1) * perPage;

  const where = {
    companyId,
    ...(status ? { status } : {}),
    ...(sellerId ? { sellerId } : {}),
    ...(type ? { type } : {}),
    ...(from || to ? {
      saleDate: {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      },
    } : {}),
    ...(search ? {
      OR: [
        { number: { equals: parseInt(search) || undefined } },
        { customer: { name: { contains: search, mode: "insensitive" as const } } },
        { seller: { name: { contains: search, mode: "insensitive" as const } } },
      ],
    } : {}),
  };

  const [rows, total] = await Promise.all([
    db.sale.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { saleDate: "desc" },
      include: {
        seller: { select: { id: true, name: true, code: true } },
        customer: { select: { id: true, name: true } },
        items: {
          include: { product: { select: { id: true, name: true } } },
        },
      },
    }),
    db.sale.count({ where }),
  ]);

  const data: SaleWithRelations[] = rows.map((row) => ({
    ...row,
    totalAmount: decimalToNumber(row.totalAmount),
    discount: decimalToNumber(row.discount),
    items: row.items.map((item) => ({
      ...item,
      quantity: decimalToNumber(item.quantity),
      unitPrice: decimalToNumber(item.unitPrice),
      discount: decimalToNumber(item.discount),
      totalPrice: decimalToNumber(item.totalPrice),
    })),
  }));

  return { data, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function getSaleById(companyId: string, saleId: string) {
  return db.sale.findFirst({
    where: { id: saleId, companyId },
    include: {
      seller: true,
      customer: true,
      items: { include: { product: true } },
      commissions: true,
      postSaleActivities: { include: { assignedSeller: true } },
    },
  });
}

async function getNextSaleNumber(companyId: string): Promise<number> {
  const last = await db.sale.findFirst({
    where: { companyId },
    orderBy: { number: "desc" },
    select: { number: true },
  });
  return (last?.number ?? 0) + 1;
}

async function calculateCommission(
  sellerId: string,
  baseAmount: number,
  type: CommissionType,
  value: number
): Promise<number> {
  if (type === CommissionType.NONE) return 0;
  if (type === CommissionType.FIXED) return value;
  if (type === CommissionType.PERCENTAGE) return (baseAmount * value) / 100;
  if (type === CommissionType.MIXED) return value + (baseAmount * value) / 200;
  return 0;
}

export async function createSale(
  companyId: string,
  input: SaleInput
): Promise<ActionResult<Sale>> {
  try {
    const parsed = saleSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Erro de validação" };

    const seller = await db.seller.findFirst({ where: { id: parsed.data.sellerId, companyId } });
    if (!seller) return { success: false, error: "Vendedor não encontrado" };

    const number = await getNextSaleNumber(companyId);

    const items = parsed.data.items.map((item) => {
      const total = item.quantity * item.unitPrice - item.discount;
      return { ...item, totalPrice: total };
    });

    const subtotal = items.reduce((acc, i) => acc + i.totalPrice, 0);
    const totalAmount = subtotal - (parsed.data.discount ?? 0);

    const commissionAmount = await calculateCommission(
      seller.id,
      totalAmount,
      seller.commissionType,
      Number(seller.commissionValue)
    );

    const sale = await db.$transaction(async (tx) => {
      const s = await tx.sale.create({
        data: {
          companyId,
          sellerId: parsed.data.sellerId,
          customerId: parsed.data.customerId ?? null,
          number,
          type: parsed.data.type,
          status: parsed.data.status,
          totalAmount,
          discount: parsed.data.discount ?? 0,
          notes: parsed.data.notes ?? null,
          saleDate: new Date(parsed.data.saleDate),
          expectedDelivery: parsed.data.expectedDelivery ? new Date(parsed.data.expectedDelivery) : null,
          items: {
            create: items.map((item) => ({
              productId: item.productId ?? null,
              description: item.description ?? null,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount,
              totalPrice: item.totalPrice,
              rentalStart: item.rentalStart ? new Date(item.rentalStart) : null,
              rentalEnd: item.rentalEnd ? new Date(item.rentalEnd) : null,
            })),
          },
        },
      });

      if (commissionAmount > 0 && parsed.data.status !== SaleStatus.DRAFT) {
        await tx.commission.create({
          data: {
            saleId: s.id,
            sellerId: seller.id,
            companyId,
            baseAmount: totalAmount,
            rate: Number(seller.commissionValue),
            amount: commissionAmount,
            type: seller.commissionType,
          },
        });

        await tx.financialTransaction.create({
          data: {
            companyId,
            type: "INCOME",
            category: "Venda",
            amount: totalAmount,
            description: `Venda #${number}`,
            referenceId: s.id,
            referenceType: "sale",
            date: new Date(parsed.data.saleDate),
          },
        });
      }

      return s;
    });

    const company = await db.company.findUnique({
      where: { id: companyId },
      select: { slug: true },
    });
    if (company) {
      const session = await auth.api.getSession({ headers: await headers() });
      void trackOpenPanelSaleCreated({
        companySlug: company.slug,
        saleId: sale.id,
        saleNumber: sale.number,
        status: sale.status,
        amount: Number(sale.totalAmount),
        profileId: session?.user?.id,
      }).catch((err) => console.error("[OpenPanel] sale_created", err));
    }

    return { success: true, data: sale };
  } catch (error) {
    console.error("[createSale]", error);
    return { success: false, error: formatServerActionError(error, "Erro ao criar venda") };
  }
}

export async function updateSaleStatus(
  companyId: string,
  saleId: string,
  status: SaleStatus
): Promise<ActionResult> {
  try {
    const sale = await db.sale.findFirst({ where: { id: saleId, companyId } });
    if (!sale) return { success: false, error: "Venda não encontrada" };

    const previousStatus = sale.status;

    await db.sale.update({
      where: { id: saleId },
      data: {
        status,
        ...(status === SaleStatus.DELIVERED ? { deliveredAt: new Date() } : {}),
      },
    });

    const company = await db.company.findUnique({
      where: { id: companyId },
      select: { slug: true },
    });
    if (company) {
      const session = await auth.api.getSession({ headers: await headers() });
      void trackOpenPanelSaleStatusUpdated({
        companySlug: company.slug,
        saleId: sale.id,
        saleNumber: sale.number,
        previousStatus,
        status,
        amount: Number(sale.totalAmount),
        profileId: session?.user?.id,
      }).catch((err) => console.error("[OpenPanel] sale_status_updated", err));
    }

    return { success: true };
  } catch (error) {
    console.error("[updateSaleStatus]", error);
    return { success: false, error: formatServerActionError(error, "Erro ao atualizar status") };
  }
}
