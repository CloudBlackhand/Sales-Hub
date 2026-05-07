import { z } from "zod";
import { CommissionType } from "@/lib/prisma-types";

export const sellerSchema = z.object({
  code: z.string().min(1, "Código obrigatório"),
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  commissionType: z.nativeEnum(CommissionType),
  commissionValue: z.number().min(0).default(0),
  isActive: z.boolean().default(true),
  hiredAt: z.string().optional(),
});

export type SellerInput = z.infer<typeof sellerSchema>;
