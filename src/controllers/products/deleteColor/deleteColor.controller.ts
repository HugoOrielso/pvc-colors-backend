// controllers/products/delete-color.controller.ts
import { type Request, type Response } from "express";
import { deleteProductColor } from "../../../services/products/delete-color.service";

export async function deleteColorController(req: Request, res: Response) {
  try {
    const { id, colorId } = req.params as {
      id: string;
      colorId: string;
    };

    console.log("aqui")

    const color = await deleteProductColor({
      productId: id,
      colorId,
    });

    if (!color) {
      return res.status(404).json({
        message: "Color no encontrado para este producto",
      });
    }

    return res.status(200).json({
      message: "Color desactivado correctamente",
      data: color,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error eliminando color",
      error: error?.message,
    });
  }
}