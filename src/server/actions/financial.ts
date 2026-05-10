"use server";

import { db } from "@/lib/db";
import { formatServerActionError } from "@/lib/demo-read-only";
import { ActionResult, PaginatedResult } from "@/types";
import { FinancialTransaction, TransactionType } from "@/lib/prisma-types";
import { transactionSchema, type TransactionInput } from "@/lib/schemas/financial";
import { decimalToNumber } from "@/lib/decimal-json";
import type { CommissionListItem, TransactionListItem } from "@/lib/dashboard/contracts";

export async function getTransactions(
  companyId: string,
  params: { page?: number; perPage?: number; type?: TransactionType; from?: string; to?: string } = {}
): Promise<PaginatedResult<TransactionListItem>> {
  const { page = 1, perPage = 20, type, from, to } = params;
  const skip = (page - 1) * perPage;

  const where = {
    companyId,
    ...(type ? { type } : {}),
    ...(from || to ? {
      date: {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      },
    } : {}),
  };

  const [rows, total] = await Promise.all([
    db.financialTransaction.findMany({ where, skip, take: perPage, orderBy: { date: "desc" } }),
    db.financialTransaction.count({ where }),
  ]);

  const data: TransactionListItem[] = rows.map((row) => ({
    ...row,
    amount: decimalToNumber(row.amount),
  }));

  return { data, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function createTransaction(
  companyId: string,
  input: TransactionInput
): Promise<ActionResult<FinancialTransaction>> {
  try {
    const parsed = transactionSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Erro de validação" };

    const transaction = await db.financialTransaction.create({
      data: { ...parsed.data, companyId, date: new Date(parsed.data.date) },
    });
    return { success: true, data: transaction };
  } catch (error) {
    console.error("[createTransaction]", error);
    return { success: false, error: formatServerActionError(error, "Erro ao criar lançamento") };
  }
}

export async function getFinancialSummary(companyId: string, from?: string, to?: string) {
  const dateFilter = from || to ? {
    date: {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    },
  } : {};

  const commissionCreatedFilter = from || to ? {
    createdAt: {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    },
  } : {};

  const [incomes, expenses, commissions, pendingCommissions] = await Promise.all([
    db.financialTransaction.aggregate({
      where: { companyId, type: TransactionType.INCOME, ...dateFilter },
      _sum: { amount: true },
    }),
    db.financialTransaction.aggregate({
      where: { companyId, type: TransactionType.EXPENSE, ...dateFilter },
      _sum: { amount: true },
    }),
    db.commission.aggregate({
      where: { companyId, status: "PAID", ...commissionCreatedFilter },
      _sum: { amount: true },
    }),
    db.commission.aggregate({
      where: { companyId, status: { in: ["PENDING", "APPROVED"] }, ...commissionCreatedFilter },
      _sum: { amount: true },
    }),
  ]);

  return {
    totalIncome: Number(incomes._sum.amount ?? 0),
    totalExpense: Number(expenses._sum.amount ?? 0),
    balance: Number(incomes._sum.amount ?? 0) - Number(expenses._sum.amount ?? 0),
    commissionsPaid: Number(commissions._sum.amount ?? 0),
    commissionsPending: Number(pendingCommissions._sum.amount ?? 0),
  };
}

export async function getCommissions(
  companyId: string,
  params: {
    page?: number;
    perPage?: number;
    sellerId?: string;
    status?: string;
    from?: string;
    to?: string;
  } = {}
): Promise<PaginatedResult<CommissionListItem>> {
  const { page = 1, perPage = 20, sellerId, status, from, to } = params;
  const skip = (page - 1) * perPage;

  const where = {
    companyId,
    ...(sellerId ? { sellerId } : {}),
    ...(status ? { status: status as "PENDING" | "APPROVED" | "PAID" | "CANCELLED" } : {}),
    ...(from || to ? {
      createdAt: {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      },
    } : {}),
  };

  const [rows, total] = await Promise.all([
    db.commission.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { createdAt: "desc" },
      include: {
        seller: { select: { id: true, name: true, code: true } },
        sale: { select: { id: true, number: true, saleDate: true } },
      },
    }),
    db.commission.count({ where }),
  ]);

  const data: CommissionListItem[] = rows.map((row) => ({
    ...row,
    baseAmount: decimalToNumber(row.baseAmount),
    rate: decimalToNumber(row.rate),
    amount: decimalToNumber(row.amount),
  }));

  return { data, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function approveCommission(companyId: string, commissionId: string): Promise<ActionResult> {
  try {
    const commission = await db.commission.findFirst({ where: { id: commissionId, companyId } });
    if (!commission) return { success: false, error: "Comissão não encontrada" };
    await db.commission.update({ where: { id: commissionId }, data: { status: "APPROVED" } });
    return { success: true };
  } catch (error) {
    return { success: false, error: formatServerActionError(error, "Erro ao aprovar comissão") };
  }
}

export async function payCommission(companyId: string, commissionId: string): Promise<ActionResult> {
  try {
    const commission = await db.commission.findFirst({ where: { id: commissionId, companyId, status: "APPROVED" } });
    if (!commission) return { success: false, error: "Comissão não encontrada ou não aprovada" };

    await db.$transaction([
      db.commission.update({
        where: { id: commissionId },
        data: { status: "PAID", paidAt: new Date() },
      }),
      db.financialTransaction.create({
        data: {
          companyId,
          type: TransactionType.COMMISSION_PAYMENT,
          category: "Comissão",
          amount: Number(commission.amount),
          description: `Pagamento de comissão`,
          referenceId: commissionId,
          referenceType: "commission",
          date: new Date(),
        },
      }),
    ]);

    return { success: true };
  } catch (error) {
    return { success: false, error: formatServerActionError(error, "Erro ao pagar comissão") };
  }
}
