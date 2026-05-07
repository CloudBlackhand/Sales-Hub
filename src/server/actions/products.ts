"use server";

import { db } from "@/lib/db";
import { ActionResult, PaginatedResult } from "@/types";
import { Product, ProductType } from "@/generated/prisma";
import { productSchema, type ProductInput } from "@/lib/schemas/products";

export async function getProducts(
  companyId: string,
  params: { page?: number; perPage?: number; search?: string; type?: ProductType } = {}
): Promise<PaginatedResult<Product>> {
  const { page = 1, perPage = 20, search, type } = params;
  const skip = (page - 1) * perPage;

  const where = {
    companyId,
    ...(type ? { type } : {}),
    ...(search ? {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { sku: { contains: search, mode: "insensitive" as const } },
      ],
    } : {}),
  };

  const [data, total] = await Promise.all([
    db.product.findMany({ where, skip, take: perPage, orderBy: { name: "asc" } }),
    db.product.count({ where }),
  ]);

  return { data, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function createProduct(
  companyId: string,
  input: ProductInput
): Promise<ActionResult<Product>> {
  try {
    const parsed = productSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Erro de validação" };

    if (parsed.data.sku) {
      const exists = await db.product.findUnique({
        where: { companyId_sku: { companyId, sku: parsed.data.sku } },
      });
      if (exists) return { success: false, error: "SKU já cadastrado" };
    }

    const product = await db.product.create({
      data: { ...parsed.data, companyId },
    });
    return { success: true, data: product };
  } catch (error) {
    console.error("[createProduct]", error);
    return { success: false, error: "Erro ao criar produto" };
  }
}

export async function updateProduct(
  companyId: string,
  productId: string,
  input: ProductInput
): Promise<ActionResult<Product>> {
  try {
    const parsed = productSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Erro de validação" };

    const product = await db.product.findFirst({ where: { id: productId, companyId } });
    if (!product) return { success: false, error: "Produto não encontrado" };

    const updated = await db.product.update({ where: { id: productId }, data: parsed.data });
    return { success: true, data: updated };
  } catch (error) {
    console.error("[updateProduct]", error);
    return { success: false, error: "Erro ao atualizar produto" };
  }
}

export async function deleteProduct(companyId: string, productId: string): Promise<ActionResult> {
  try {
    const product = await db.product.findFirst({ where: { id: productId, companyId } });
    if (!product) return { success: false, error: "Produto não encontrado" };
    await db.product.update({ where: { id: productId }, data: { isActive: false } });
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao excluir produto" };
  }
}
