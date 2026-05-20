// controllers/productLines/updateProductLine.controller.ts
import { Request, Response } from "express";
import { z } from "zod";
import { updateProductLineSchema } from "../../../schemas/line/productsLines.schema";
import { uploadBufferToCloudinary } from "../../../utils/cloudinary/upload";
import { updateProductLine } from "../../../services/lines/updateLine.service";

export async function updateProductLineController(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params as { id: string };

    const validatedData = updateProductLineSchema.parse(req.body);
    const imageFile = req.file;

    let imageUrl: string | undefined;

    if (imageFile) {
      imageUrl = await uploadBufferToCloudinary(
        imageFile.buffer,
        "product-lines"
      );
    }

    const productLine = await updateProductLine(id, {
      ...validatedData,
      ...(imageUrl ? { image: imageUrl } : {}),
    });

    return res.status(200).json({
      message: "Línea de producto actualizada correctamente",
      data: productLine,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Error de validación",
        errors: error.issues,
      });
    }

    if (error?.code === "P2002") {
      return res.status(409).json({
        message: "Ya existe una línea con ese slug",
      });
    }

    console.error("updateProductLine error:", error);

    return res.status(500).json({
      message: "Error actualizando línea de producto",
      error: error?.message,
    });
  }
}