// controllers/products/delete-image.controller.ts
import { type Request, type Response } from "express";

import { deleteProductImage } from "../../../services/products/delete-image.service";

export async function deleteImageController(
  req: Request,
  res: Response
) {
  try {
    const { id, imageId } = req.params as {
      id: string;
      imageId: string;
    };

    const image = await deleteProductImage({
      productId: id,
      imageId,
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        message:
          "Imagen no encontrada para este producto",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Imagen desactivada correctamente",
      data: image,
    });
  } catch (error: any) {
    console.error(
      "Error eliminando imagen:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Error eliminando imagen",
      error: error?.message,
    });
  }
}