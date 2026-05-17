import { type Request, type Response } from "express";
import {
  deleteImageFromCloudinary,
  getCloudinaryPublicId,
  uploadBufferToCloudinary,
  uploadPdfBufferToCloudinary,
} from "../../../utils/cloudinary/upload";
import { UpdateProductServiceInput } from "../../../schemas/products/products.schema";
import { getProductById } from "../../../services/products/get-product-by-id.service";
import { updateProduct } from "../../../services/products/update-product.service";

function parseJsonArray<T>(value: unknown): T[] | undefined {
  if (Array.isArray(value)) return value as T[];

  if (typeof value !== "string") return undefined;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : undefined;
  } catch {
    return undefined;
  }
}

type ProductFiles = {
  images?: Express.Multer.File[];
  technicalSheet?: Express.Multer.File[];
};

export async function updateProductController(req: Request, res: Response) {
  try {
    const { id } = req.params as { id: string };

    const existingProduct = await getProductById(id);

    if (!existingProduct) {
      return res.status(404).json({
        message: "Producto no encontrado",
      });
    }

    const files = req.files as ProductFiles | undefined;

    const imageFiles = files?.images ?? [];
    const technicalSheetFile = files?.technicalSheet?.[0];

    const existingImages = parseJsonArray<{
      id: string;
      alt?: string | null;
      position?: number;
      isMain?: boolean;
    }>(req.body.existingImages);

    let uploadedImages:
      | {
          url: string;
          publicId?: string | null;
          alt?: string | null;
          position?: number;
          isMain?: boolean;
        }[]
      | undefined;

    let technicalSheetUrl: string | undefined;

    if (imageFiles.length > 0) {
      const existingImagesCount = existingImages?.length ?? 0;

      uploadedImages = await Promise.all(
        imageFiles.map(async (file, index) => {
          const imageUrl = await uploadBufferToCloudinary(
            file.buffer,
            "products/images"
          );

          return {
            url: imageUrl,
            publicId: getCloudinaryPublicId(imageUrl) ?? null,
            alt: file.originalname ?? req.body.name ?? existingProduct.name,
            position: existingImagesCount + index,
            isMain: existingImagesCount === 0 && index === 0,
          };
        })
      );
    }

    if (technicalSheetFile) {
      if (existingProduct.technicalSheetUrl) {
        const publicId = getCloudinaryPublicId(
          existingProduct.technicalSheetUrl
        );

        if (publicId) {
          await deleteImageFromCloudinary(publicId);
        }
      }

      technicalSheetUrl = await uploadPdfBufferToCloudinary(
        technicalSheetFile.buffer,
        "products/technical-sheets"
      );
    }

    const colors = parseJsonArray<{
      name?: string | null;
      value: string;
    }>(req.body.colors);

    const presentations = parseJsonArray<{
      name: string;
      price: number;
      stock: number;
      sku?: string | null;
    }>(req.body.presentations);

    const validatedData: UpdateProductServiceInput = {
      name: req.body.name,
      slug: req.body.slug,
      description: req.body.description,
      recommendations: req.body.recommendations,
      productLineId: req.body.productLineId,

      colors,
      presentations,
      existingImages,

      ...(uploadedImages && { images: uploadedImages }),
      ...(technicalSheetUrl && { technicalSheetUrl }),
    };

    const product = await updateProduct(id, validatedData);

    return res.json({
      message: "Producto actualizado correctamente",
      data: product,
    });
  } catch (error: any) {
    if (
      error?.message?.includes("Password-protected PDFs are not supported")
    ) {
      return res.status(400).json({
        message: "El PDF tiene contraseña. Debes subir un PDF sin protección.",
      });
    }

    if (error?.code === "P2002") {
      return res.status(409).json({
        message: "Ya existe un producto con ese slug",
      });
    }

    return res.status(500).json({
      message: error?.message || "Error actualizando producto",
    });
  }
}