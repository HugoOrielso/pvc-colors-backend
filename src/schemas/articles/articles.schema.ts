// schemas/articles.schema.ts
import { z } from "zod";

export const createArticleSchema = z.object({
  title: z.string().min(2, "El título es obligatorio"),
  markdown: z.string().min(1, "El contenido es obligatorio"),
});

export const updateArticleSchema = z.object({
  title: z.string().min(2).optional(),
  markdown: z.string().min(1).optional(),
});

export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;