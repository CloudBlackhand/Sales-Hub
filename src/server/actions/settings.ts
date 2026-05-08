"use server";

import { db } from "@/lib/db";
import { ActionResult } from "@/types";
import {
  companySettingsSchema,
  type CompanySettingsInput,
} from "@/lib/schemas/company-settings";

export type { CompanySettingsInput };
export { companySettingsSchema };

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
