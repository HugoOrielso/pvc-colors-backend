import { z } from "zod";

export const createProductLineSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  slug: z.string().min(1, "El slug es obligatorio"),
  description: z.string().min(1, "La descripción es obligatoria"),
});
export const updateProductLineSchema = createProductLineSchema.partial();

export type CreateProductLineInput = z.infer<typeof createProductLineSchema>;
export type UpdateProductLineInput = z.infer<typeof updateProductLineSchema>;