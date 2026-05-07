import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  document: z.string().optional(),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    number: z.string().optional(),
    complement: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
  }).optional(),
});

export type CustomerInput = z.infer<typeof customerSchema>;
