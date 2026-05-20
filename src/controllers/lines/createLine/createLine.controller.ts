import { type Request, type Response } from "express";
import { createProductLineSchema } from "../../../schemas/line/productsLines.schema";
import { createProductLine } from "../../../services/lines/lines.service";
import { uploadBufferToCloudinary } from "../../../utils/cloudinary/upload";
import z from "zod";

export async function createProductLineController(
  req: Request,
  res: Response,
) {
  try {

    const validatedData = createProductLineSchema.parse(req.body);
    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({
        message: "La imagen de la línea es obligatoria",
      });
    }

    const imageUrl = await uploadBufferToCloudinary(
      imageFile.buffer,
      "product-lines"
    );

    const productLine = await createProductLine({
      ...validatedData,
      image: imageUrl,
    });

    return res.status(201).json({
      message: "Línea de producto creada correctamente",
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

    console.error("createProductLine error:", error);

    return res.status(500).json({
      message: "Error creando línea de producto",
      error: error?.message,
    });
  }
}