import { z } from "zod";

export const createCompanySchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  cnpj: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
