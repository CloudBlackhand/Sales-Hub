import { z } from "zod";
import { PostSaleType, ActivityStatus } from "@/generated/prisma";

export const postSaleSchema = z.object({
  saleId: z.string().min(1),
  type: z.nativeEnum(PostSaleType),
  status: z.nativeEnum(ActivityStatus).default(ActivityStatus.OPEN),
  title: z.string().optional(),
  notes: z.string().optional(),
  scheduledAt: z.string().optional().nullable(),
  assignedToSellerId: z.string().optional().nullable(),
});

export type PostSaleInput = z.infer<typeof postSaleSchema>;
