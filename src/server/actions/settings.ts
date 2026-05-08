"use server";

import { db } from "@/lib/db";
import { ActionResult } from "@/types";
import {
  companySettingsSchema,
  type CompanySettingsInput,
} from "@/lib/schemas/company-settings";
import {
  companyProfileSchema,
  type CompanyProfileInput,
} from "@/lib/schemas/company-profile";

export type { CompanySettingsInput };
export { companySettingsSchema };
export type { CompanyProfileInput };
export { companyProfileSchema };

export async function updateCompanyInfo(
  companyId: string,
  input: CompanySettingsInput
): Promise<ActionResult> {
  try {
    const parsed = companySettingsSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Erro de validação" };
    await db.company.update({ where: { id: companyId }, data: parsed.data });
    return { success: true };
  } catch {
    return { success: false, error: "Erro ao atualizar" };
  }
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export async function updateCompanyProfile(
  companyId: string,
  input: CompanyProfileInput
): Promise<ActionResult> {
  try {
    const parsed = companyProfileSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Erro de validação" };
    }

    const normalized = {
      displayName: parsed.data.displayName?.trim() ?? "",
      slogan: parsed.data.slogan?.trim() ?? "",
      bio: parsed.data.bio?.trim() ?? "",
      coverUrl: parsed.data.coverUrl?.trim() ?? "",
      website: parsed.data.website?.trim() ?? "",
      instagram: parsed.data.instagram?.trim() ?? "",
      linkedin: parsed.data.linkedin?.trim() ?? "",
      city: parsed.data.city?.trim() ?? "",
      state: parsed.data.state?.trim() ?? "",
      country: parsed.data.country?.trim() ?? "",
    };

    const logoUrl = parsed.data.logoUrl?.trim() ?? "";

    await db.$transaction(async (tx) => {
      const existingSettings = await tx.companySettings.findUnique({
        where: { companyId },
        select: { customFields: true },
      });

      const root = asObject(existingSettings?.customFields);
      const currentProfile = asObject(root.profile);

      await tx.companySettings.upsert({
        where: { companyId },
        create: {
          companyId,
          customFields: {
            profile: { ...currentProfile, ...normalized },
          },
        },
        update: {
          customFields: {
            ...root,
            profile: { ...currentProfile, ...normalized },
          },
        },
      });

      await tx.company.update({
        where: { id: companyId },
        data: {
          logo: logoUrl || null,
        },
      });
    });

    return { success: true };
  } catch {
    return { success: false, error: "Erro ao atualizar perfil da empresa" };
  }
}
