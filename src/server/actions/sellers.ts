"use server";

import { db } from "@/lib/db";
import { ActionResult, PaginatedResult } from "@/types";
import { Seller, CommissionType } from "@/lib/prisma-types";
import { sellerSchema, type SellerInput } from "@/lib/schemas/sellers";

export async function getSellers(
  companyId: string,
  params: { page?: number; perPage?: number; search?: string } = {}
): Promise<PaginatedResult<Seller>> {
  const { page = 1, perPage = 20, search } = params;
  const skip = (page - 1) * perPage;

  const where = {
    companyId,
    ...(search ? {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { code: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
      ],
    } : {}),
  };

  const [data, total] = await Promise.all([
    db.seller.findMany({ where, skip, take: perPage, orderBy: { name: "asc" } }),
    db.seller.count({ where }),
  ]);

  return { data, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function createSeller(
  companyId: string,
  input: SellerInput
): Promise<ActionResult<Seller>> {
  try {
    const parsed = sellerSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Erro de validação" };

    const exists = await db.seller.findUnique({
      where: { companyId_code: { companyId, code: parsed.data.code } },
    });
    if (exists) return { success: false, error: "Código de vendedor já existe" };

    const seller = await db.seller.create({
      data: {
        ...parsed.data,
        commissionValue: parsed.data.commissionValue,
        hiredAt: parsed.data.hiredAt ? new Date(parsed.data.hiredAt) : null,
        companyId,
      },
    });

    return { success: true, data: seller };
  } catch (error) {
    console.error("[createSeller]", error);
    return { success: false, error: "Erro ao criar vendedor" };
  }
}

export async function updateSeller(
  companyId: string,
  sellerId: string,
  input: SellerInput
): Promise<ActionResult<Seller>> {
  try {
    const parsed = sellerSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Erro de validação" };

    const seller = await db.seller.findFirst({ where: { id: sellerId, companyId } });
    if (!seller) return { success: false, error: "Vendedor não encontrado" };

    const updated = await db.seller.update({
      where: { id: sellerId },
      data: {
        ...parsed.data,
        commissionValue: parsed.data.commissionValue,
        hiredAt: parsed.data.hiredAt ? new Date(parsed.data.hiredAt) : null,
      },
    });

    return { success: true, data: updated };
  } catch (error) {
    console.error("[updateSeller]", error);
    return { success: false, error: "Erro ao atualizar vendedor" };
  }
}

export async function toggleSellerStatus(
  companyId: string,
  sellerId: string
): Promise<ActionResult> {
  try {
    const seller = await db.seller.findFirst({ where: { id: sellerId, companyId } });
    if (!seller) return { success: false, error: "Vendedor não encontrado" };
    await db.seller.update({ where: { id: sellerId }, data: { isActive: !seller.isActive } });
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao alterar status" };
  }
}
