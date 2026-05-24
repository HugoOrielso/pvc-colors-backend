import { z } from "zod";

export const checkoutCustomerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, { error: "El nombre completo es obligatorio" }),

  documentType: z
    .string()
    .trim()
    .min(1, { error: "El tipo de documento es obligatorio" }),

  documentNumber: z
    .string()
    .trim()
    .min(5, { error: "El número de documento es obligatorio" }),

  address: z
    .string()
    .trim()
    .min(5, { error: "La dirección es obligatoria" }),

  email: z
    .string()
    .trim()
    .email({ error: "Correo electrónico inválido" }),

  phone: z
    .string()
    .trim()
    .min(7, { error: "Teléfono inválido" }),

  city: z
    .string()
    .trim()
    .min(2, { error: "La ciudad es obligatoria" }),

  department: z
    .string()
    .trim()
    .min(2, { error: "El departamento es obligatorio" }),

  country: z
    .string()
    .trim()
    .min(2, { error: "El país es obligatorio" }),
});

export const checkoutItemSchema = z.object({
  productId: z
    .string()
    .trim()
    .min(1, { error: "El productId es obligatorio" }),

  presentationId: z
    .string()
    .trim()
    .min(1, { error: "El presentationId es obligatorio" }),

  color: z.string().trim().optional().nullable(),

  colorName: z.string().trim().optional().nullable(),

  colorValue: z.string().trim().optional().nullable(),

  quantity: z
    .number({
      error: (issue) =>
        issue.input === undefined
          ? "La cantidad es obligatoria"
          : "La cantidad debe ser numérica",
    })
    .int({ error: "La cantidad debe ser un número entero" })
    .positive({ error: "La cantidad debe ser mayor a 0" }),
});

export const createWompiCheckoutSchema = z.object({
  customer: checkoutCustomerSchema,

  items: z
    .array(checkoutItemSchema, {
      error: "Los items son obligatorios",
    })
    .min(1, {
      error: "Debes enviar al menos un producto",
    }),
});

export type CreateWompiCheckoutInput = z.infer<
  typeof createWompiCheckoutSchema
>;