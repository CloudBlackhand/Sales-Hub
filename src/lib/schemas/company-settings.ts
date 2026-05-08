import { z } from "zod";

/** Schema partilhado — NÃO importar de ficheiros `"use server"` nos client components (quebra o zodResolver). */
export const companySettingsSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  cnpj: z.string().optional(),
  phone: z.string().optional(),
  email: z.union([z.string().email(), z.literal("")]).optional(),
});

export type CompanySettingsInput = z.infer<typeof companySettingsSchema>;
