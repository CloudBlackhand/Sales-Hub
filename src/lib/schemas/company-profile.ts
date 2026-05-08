import { z } from "zod";

const optionalUrl = z.union([z.string().url("URL inválida"), z.literal("")]).optional();

/** Schema partilhado para perfil social da empresa. */
export const companyProfileSchema = z.object({
  displayName: z.string().max(80, "Máximo de 80 caracteres").optional(),
  slogan: z.string().max(120, "Máximo de 120 caracteres").optional(),
  bio: z.string().max(500, "Máximo de 500 caracteres").optional(),
  coverUrl: optionalUrl,
  logoUrl: optionalUrl,
  website: optionalUrl,
  instagram: optionalUrl,
  linkedin: optionalUrl,
  city: z.string().max(80, "Máximo de 80 caracteres").optional(),
  state: z.string().max(80, "Máximo de 80 caracteres").optional(),
  country: z.string().max(80, "Máximo de 80 caracteres").optional(),
});

export type CompanyProfileInput = z.infer<typeof companyProfileSchema>;
