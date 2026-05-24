import { z } from "zod";

const parseJsonArray = (value: unknown) => {
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const featureSchema = z.object({
  name: z.string().min(
    1,
    "El nombre de la característica es obligatorio"
  ),

  description: z
    .string()
    .optional()
    .nullable(),
});

const colorSchema = z.object({
  name: z.string().optional().nullable(),
  value: z.string().min(1, "El color es obligatorio"),
});

const colorGroupSchema = z.object({
  name: z.string().min(1, "El nombre del grupo es obligatorio"),
  description: z.string().optional().nullable(),
  colors: z.array(colorSchema).min(1, "El grupo debe tener al menos un color"),
});

const existingImageSchema = z.object({
  id: z.string().uuid("La imagen no es válida"),
  alt: z.string().optional().nullable(),
  position: z.coerce.number().int().min(0).optional(),
  isMain: z.coerce.boolean().optional(),
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

  coverageMinM2PerGallon: z.coerce
    .number()
    .positive("La cobertura mínima debe ser mayor a 0")
    .optional()
    .nullable(),

  coverageMaxM2PerGallon: z.coerce
    .number()
    .positive("La cobertura máxima debe ser mayor a 0")
    .optional()
    .nullable(),

  productLineId: z.string().uuid("La línea del producto no es válida"),
  features: z.preprocess(
    parseJsonArray,
    z.array(featureSchema).optional()
  ),

  colors: z.preprocess(
    parseJsonArray,
    z.array(colorSchema).optional()
  ),
  colorGroups: z.preprocess(
    parseJsonArray,
    z.array(colorGroupSchema).optional()
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

const hasNoRepeatedFeatures = (data: {
  features?: { name: string }[];
}) => {
  if (!data.features) return true;

  const names = data.features.map((feature) =>
    feature.name.trim().toLowerCase()
  );

  return new Set(names).size === names.length;
};

const hasNoRepeatedColorGroups = (data: {
  colorGroups?: { name: string }[];
}) => {
  if (!data.colorGroups) return true;

  const names = data.colorGroups.map((group) =>
    group.name.trim().toLowerCase()
  );

  return new Set(names).size === names.length;
};

const hasNoRepeatedColors = (data: {
  colors?: { value: string }[];
  colorGroups?: {
    colors: { value: string }[];
  }[];
}) => {
  const normalize = (value: string) => value.trim().toLowerCase();

  // Colores simples: no se pueden repetir entre ellos
  const simpleColors = data.colors ?? [];
  const simpleValues = simpleColors.map((color) => normalize(color.value));

  if (new Set(simpleValues).size !== simpleValues.length) {
    return false;
  }

  // Dentro de cada grupo: no se pueden repetir
  const groups = data.colorGroups ?? [];

  for (const group of groups) {
    const groupValues = group.colors.map((color) => normalize(color.value));

    if (new Set(groupValues).size !== groupValues.length) {
      return false;
    }
  }

  return true;
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
  .refine(hasNoRepeatedColorGroups, {
    message: "No puedes repetir grupos de colores",
    path: ["colorGroups"],
  })
  .refine(hasNoRepeatedPresentations, {
    message: "No puedes repetir presentaciones",
    path: ["presentations"],
  })
  .refine(hasNoRepeatedFeatures, {
    message: "No puedes repetir características",
    path: ["features"],
  })

export const updateProductSchema = baseProductSchema
  .partial()
  .refine(hasNoRepeatedColors, {
    message: "No puedes repetir colores",
    path: ["colors"],
  })
  .refine(hasNoRepeatedColorGroups, {
    message: "No puedes repetir grupos de colores",
    path: ["colorGroups"],
  })
  .refine(hasNoRepeatedPresentations, {
    message: "No puedes repetir presentaciones",
    path: ["presentations"],
  })
  .refine(hasNoRepeatedFeatures, {
    message: "No puedes repetir características",
    path: ["features"],
  })

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
