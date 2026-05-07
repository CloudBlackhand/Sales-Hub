import { z } from "zod";
import { TransactionType } from "@/lib/prisma-types";

export const transactionSchema = z.object({
  type: z.nativeEnum(TransactionType),
  category: z.string().optional(),
  amount: z.number().min(0.01),
  description: z.string().optional(),
  date: z.string(),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
