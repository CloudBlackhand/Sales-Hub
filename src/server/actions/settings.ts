"use server";

import { db } from "@/lib/db";
import { ActionResult } from "@/types";
import { z } from "zod";

export const companySettingsSchema = z.object({
  name: z.string().min(2),
  cnpj: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
});

export type CompanySettingsInput = z.infer<typeof companySettingsSchema>;

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
