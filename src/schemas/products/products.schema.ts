import { z } from "zod";

const parseJsonArray = (value: unknown) => {
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const existingImageSchema = z.object({
  id: z.string().uuid("La imagen no es válida"),
  alt: z.string().optional().nullable(),
  position: z.coerce.number().int().min(0).optional(),
  isMain: z.coerce.boolean().optional(),
});

const colorSchema = z.object({
  name: z.string().optional().nullable(),
  value: z.string().min(1, "El color es obligatorio"),
});

const presentationSchema = z.object({
  name: z.string().min(1, "La presentación es obligatoria"),

  price: z.coerce
    .number()
    .int("El precio debe ser entero")
    .positive("El precio debe ser mayor a 0"),

  stock: z.coerce
    .number()
    .int("El stock debe ser entero")
    .min(0, "El stock no puede ser negativo"),

  sku: z.string().optional().nullable(),
});

const baseProductSchema = z.object({
  slug: z
    .string()
    .min(3, "El slug debe tener mínimo 3 caracteres")
    .max(100, "El slug no puede tener más de 100 caracteres")
    .regex(
      /^[a-z0-9-]+$/,
      "El slug solo puede contener minúsculas, números y guiones"
    ),

  name: z
    .string()
    .min(2, "El nombre debe tener mínimo 2 caracteres")
    .max(150, "El nombre no puede tener más de 150 caracteres"),

  description: z
    .string()
    .min(10, "La descripción debe tener mínimo 10 caracteres"),

  recommendations: z.string().optional().nullable(),

  productLineId: z.string().uuid("La línea del producto no es válida"),

  colors: z.preprocess(
    parseJsonArray,
    z.array(colorSchema).optional()
  ),

  presentations: z.preprocess(
    parseJsonArray,
    z.array(presentationSchema).min(
      1,
      "Debes agregar al menos una presentación"
    )
  ),
  existingImages: z.preprocess(
    parseJsonArray,
    z.array(existingImageSchema).optional()
  ),
});

const hasNoRepeatedColors = (data: {
  colors?: { value: string }[];
}) => {
  if (!data.colors) return true;

  const values = data.colors.map((color) =>
    color.value.trim().toLowerCase()
  );

  return new Set(values).size === values.length;
};

const hasNoRepeatedPresentations = (data: {
  presentations?: { name: string }[];
}) => {
  if (!data.presentations) return true;

  const names = data.presentations.map((presentation) =>
    presentation.name.trim().toLowerCase()
  );

  return new Set(names).size === names.length;
};

export const createProductSchema = baseProductSchema
  .refine(hasNoRepeatedColors, {
    message: "No puedes repetir colores",
    path: ["colors"],
  })
  .refine(hasNoRepeatedPresentations, {
    message: "No puedes repetir presentaciones",
    path: ["presentations"],
  });

export const updateProductSchema = baseProductSchema
  .partial()
  .refine(hasNoRepeatedColors, {
    message: "No puedes repetir colores",
    path: ["colors"],
  })
  .refine(hasNoRepeatedPresentations, {
    message: "No puedes repetir presentaciones",
    path: ["presentations"],
  });


export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;


export type UploadedProductImage = {
  url: string;
  publicId?: string | null;
  alt?: string | null;
  position?: number;
  isMain?: boolean;
};

export type CreateProductServiceInput =
  CreateProductInput & {
    images: UploadedProductImage[];
    technicalSheetUrl?: string | null;
  };

export type ExistingProductImage = z.infer<
  typeof existingImageSchema
>;

export type UpdateProductServiceInput =
  UpdateProductInput & {
    existingImages?: ExistingProductImage[];
    images?: UploadedProductImage[];
    technicalSheetUrl?: string | null;
  };
