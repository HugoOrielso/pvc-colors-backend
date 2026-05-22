// schemas/distributors/distributors.schema.ts
import { z } from "zod";

export const createDistributorSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio"),
  city: z.string().min(2, "La ciudad es obligatoria"),
  address: z.string().min(2, "La dirección es obligatoria"),
  phone: z.string().min(5, "El teléfono es obligatorio"),
  whatsapp: z.string().min(5, "El WhatsApp es obligatorio"),
  keyword: z.string().min(2, "La keyword es obligatoria"),

  lat: z.coerce.number({
    message: "La latitud debe ser un número",
  }),

  lng: z.coerce.number({
    message: "La longitud debe ser un número",
  }),
});

export const updateDistributorSchema = createDistributorSchema.partial();

export type CreateDistributorInput = z.infer<typeof createDistributorSchema>;
export type UpdateDistributorInput = z.infer<typeof updateDistributorSchema>;