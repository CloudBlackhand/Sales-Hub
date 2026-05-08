"use server";

import { db } from "@/lib/db";
import { ActionResult, PaginatedResult } from "@/types";
import { PostSaleActivity, ActivityStatus } from "@/lib/prisma-types";
import { postSaleSchema, type PostSaleInput } from "@/lib/schemas/post-sale";

type ActivityWithRelations = PostSaleActivity & {
  sale: { id: string; number: number };
  assignedSeller: { id: string; name: string } | null;
};

export async function getPostSaleActivities(
  companyId: string,
  params: { page?: number; perPage?: number; status?: ActivityStatus; saleId?: string } = {}
): Promise<PaginatedResult<ActivityWithRelations>> {
  const { page = 1, perPage = 20, status, saleId } = params;
  const skip = (page - 1) * perPage;

  const where = {
    companyId,
    ...(status ? { status } : {}),
    ...(saleId ? { saleId } : {}),
  };

  const [data, total] = await Promise.all([
    db.postSaleActivity.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { createdAt: "desc" },
      include: {
        sale: { select: { id: true, number: true } },
        assignedSeller: { select: { id: true, name: true } },
      },
    }),
    db.postSaleActivity.count({ where }),
  ]);

  return { data: data as ActivityWithRelations[], total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function createPostSaleActivity(
  companyId: string,
  input: PostSaleInput
): Promise<ActionResult<PostSaleActivity>> {
  try {
    const parsed = postSaleSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Erro de validação" };

    const sale = await db.sale.findFirst({ where: { id: parsed.data.saleId, companyId } });
    if (!sale) return { success: false, error: "Venda não encontrada" };

    const activity = await db.postSaleActivity.create({
      data: {
        ...parsed.data,
        companyId,
        scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : null,
      },
    });
    return { success: true, data: activity };
  } catch (error) {
    console.error("[createPostSaleActivity]", error);
    return { success: false, error: "Erro ao criar atividade" };
  }
}

export async function updateActivityStatus(
  companyId: string,
  activityId: string,
  status: ActivityStatus
): Promise<ActionResult> {
  try {
    const activity = await db.postSaleActivity.findFirst({ where: { id: activityId, companyId } });
    if (!activity) return { success: false, error: "Atividade não encontrada" };

    await db.postSaleActivity.update({
      where: { id: activityId },
      data: {
        status,
        ...(status === ActivityStatus.RESOLVED ? { completedAt: new Date() } : {}),
      },
    });
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao atualizar status" };
  }
}
