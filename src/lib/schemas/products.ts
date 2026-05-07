import { z } from "zod";
import { ProductType } from "@/lib/prisma-types";

export const productSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  sku: z.string().optional(),
  description: z.string().optional(),
  type: z.nativeEnum(ProductType),
  price: z.number().min(0),
  rentalPricePerDay: z.number().min(0).optional().nullable(),
  unit: z.string().optional(),
  stock: z.number().int().optional().nullable(),
  isActive: z.boolean().default(true),
});

export type ProductInput = z.infer<typeof productSchema>;
