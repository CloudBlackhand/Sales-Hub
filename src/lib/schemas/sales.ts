import { z } from "zod";
import { SaleType, SaleStatus } from "@/lib/prisma-types";

export const saleItemSchema = z.object({
  productId: z.string().optional().nullable(),
  description: z.string().optional(),
  quantity: z.number().min(0.001),
  unitPrice: z.number().min(0),
  discount: z.number().min(0).default(0),
  rentalStart: z.string().optional().nullable(),
  rentalEnd: z.string().optional().nullable(),
});

export const saleSchema = z.object({
  sellerId: z.string().min(1, "Vendedor obrigatório"),
  customerId: z.string().optional().nullable(),
  type: z.nativeEnum(SaleType),
  status: z.nativeEnum(SaleStatus).default(SaleStatus.DRAFT),
  discount: z.number().min(0).default(0),
  notes: z.string().optional(),
  saleDate: z.string(),
  expectedDelivery: z.string().optional().nullable(),
  items: z.array(saleItemSchema).min(1, "Adicione pelo menos um item"),
});

export type SaleInput = z.infer<typeof saleSchema>;
