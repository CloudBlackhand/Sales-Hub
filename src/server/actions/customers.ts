"use server";

import { db } from "@/lib/db";
import { ActionResult, PaginatedResult } from "@/types";
import { Customer } from "@/lib/prisma-types";
import { customerSchema, type CustomerInput } from "@/lib/schemas/customers";

export async function getCustomers(
  companyId: string,
  params: { page?: number; perPage?: number; search?: string; from?: string; to?: string } = {}
): Promise<PaginatedResult<Customer>> {
  const { page = 1, perPage = 20, search, from, to } = params;
  const skip = (page - 1) * perPage;

  const where = {
    companyId,
    ...(from || to ? {
      createdAt: {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      },
    } : {}),
    ...(search ? {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
        { phone: { contains: search, mode: "insensitive" as const } },
        { document: { contains: search, mode: "insensitive" as const } },
      ],
    } : {}),
  };

  const [data, total] = await Promise.all([
    db.customer.findMany({ where, skip, take: perPage, orderBy: { name: "asc" } }),
    db.customer.count({ where }),
  ]);

  return { data, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function createCustomer(
  companyId: string,
  input: CustomerInput
): Promise<ActionResult<Customer>> {
  try {
    const parsed = customerSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Erro de validação" };

    const customer = await db.customer.create({
      data: { ...parsed.data, companyId },
    });
    return { success: true, data: customer };
  } catch (error) {
    console.error("[createCustomer]", error);
    return { success: false, error: "Erro ao criar cliente" };
  }
}

export async function updateCustomer(
  companyId: string,
  customerId: string,
  input: CustomerInput
): Promise<ActionResult<Customer>> {
  try {
    const parsed = customerSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Erro de validação" };

    const customer = await db.customer.findFirst({ where: { id: customerId, companyId } });
    if (!customer) return { success: false, error: "Cliente não encontrado" };

    const updated = await db.customer.update({ where: { id: customerId }, data: parsed.data });
    return { success: true, data: updated };
  } catch (error) {
    console.error("[updateCustomer]", error);
    return { success: false, error: "Erro ao atualizar cliente" };
  }
}

export async function deleteCustomer(companyId: string, customerId: string): Promise<ActionResult> {
  try {
    const customer = await db.customer.findFirst({ where: { id: customerId, companyId } });
    if (!customer) return { success: false, error: "Cliente não encontrado" };
    await db.customer.delete({ where: { id: customerId } });
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao excluir cliente" };
  }
}
