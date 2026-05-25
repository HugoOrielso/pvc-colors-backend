import { Request, Response } from "express";
import { replaceProductImage } from "../../services/productImages/replaceImage.service";


export const replaceProductImageController = async (
  req: Request,
  res: Response
) => {
  try {
    const { productId, imageId } = req.params as { productId: string; imageId: string };
    const file = req.file;

    if (!productId || !imageId) {
      return res.status(400).json({
        success: false,
        message: "Faltan parámetros requeridos",
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Debes seleccionar una imagen",
      });
    }

    const image = await replaceProductImage(productId, imageId, file);

    return res.status(200).json({
      success: true,
      message: "Imagen reemplazada correctamente",
      data: image,
    });
  } catch (error: any) {
    console.error("Error replacing product image:", error);

    return res.status(400).json({
      success: false,
      message:
        error?.message || "Error reemplazando la imagen del producto",
    });
  }
};