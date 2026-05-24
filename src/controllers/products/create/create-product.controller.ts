import { CreateProductInput } from "../../../schemas/products/products.schema";
import { type Request, type Response } from "express";
import { uploadBufferToCloudinary, uploadPdfBufferToCloudinary } from "../../../utils/cloudinary/upload";
import { createProduct } from "../../../services/products/create-product.service";
import multer from "multer";

type ProductFiles = {
    images?: Express.Multer.File[];
    technicalSheet?: Express.Multer.File[];
};

export async function createProductController(req: Request, res: Response) {
    try {
        const validatedData = req.body as CreateProductInput;

        const files = req.files as ProductFiles | undefined;

        const imageFiles = files?.images ?? [];
        const technicalSheetFile = files?.technicalSheet?.[0];

        if (!imageFiles.length) {
            return res.status(400).json({
                message: "Debes subir al menos una imagen del producto",
            });
        }

        const uploadedImages = await Promise.all(
            imageFiles.map(async (file, index) => {
                const url = await uploadBufferToCloudinary(
                    file.buffer,
                    "products/images"
                );

                return {
                    url,
                    position: index,
                    isMain: index === 0,
                };
            })
        );

        let technicalSheetUrl: string | null = null;

        if (technicalSheetFile) {
            technicalSheetUrl = await uploadPdfBufferToCloudinary(
                technicalSheetFile.buffer,
                "products/technical-sheets"
            );
        }

        const product = await createProduct({
            ...validatedData,
            images: uploadedImages,
            technicalSheetUrl,
        });

        return res.status(201).json({
            message: "Producto creado correctamente",
            data: product,
        });
    } catch (error: any) {
        console.log(error)
        if (error?.code === "P2002") {
            const target = error?.meta?.target;

            return res.status(409).json({
                message: "Ya existe un registro con un valor único repetido",
                target,
            });
        }

        return res.status(500).json({
            message: "Error creando producto",
            error: error?.message,
        });
    }
}