"use server";

import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { ActionResult } from "@/types";
import { Company, MemberRole } from "@/lib/prisma-types";
import { createCompanySchema, type CreateCompanyInput } from "@/lib/schemas/company";

export async function createCompany(
  userId: string,
  userName: string,
  input: CreateCompanyInput
): Promise<ActionResult<Company>> {
  try {
    const parsed = createCompanySchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Erro de validação" };
    }

    const baseSlug = slugify(parsed.data.name);
    let slug = baseSlug;
    let attempt = 0;

    while (await db.company.findUnique({ where: { slug } })) {
      attempt++;
      slug = `${baseSlug}-${attempt}`;
    }

    const company = await db.$transaction(async (tx) => {
      const co = await tx.company.create({
        data: {
          name: parsed.data.name,
          slug,
          cnpj: parsed.data.cnpj || null,
          phone: parsed.data.phone || null,
          email: parsed.data.email || null,
          onboarded: true,
        },
      });

      await tx.companyMember.create({
        data: { userId, companyId: co.id, role: MemberRole.OWNER },
      });

      await tx.seller.create({
        data: {
          companyId: co.id,
          userId,
          code: "V0001",
          name: userName,
          commissionType: "NONE",
        },
      });

      await tx.companySettings.create({
        data: { companyId: co.id },
      });

      return co;
    });

    return { success: true, data: company };
  } catch (error) {
    console.error("[createCompany]", error);
    return { success: false, error: "Erro ao criar empresa" };
  }
}

export async function getUserCompanies(userId: string) {
  return db.companyMember.findMany({
    where: { userId },
    include: { company: true },
    orderBy: { joinedAt: "asc" },
  });
}

export async function getCompanyBySlug(slug: string) {
  return db.company.findUnique({ where: { slug } });
}

export async function validateMembership(userId: string, companyId: string) {
  return db.companyMember.findUnique({
    where: { userId_companyId: { userId, companyId } },
  });
}
