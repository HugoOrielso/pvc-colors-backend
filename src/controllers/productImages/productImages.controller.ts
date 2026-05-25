import { Request, Response } from "express";
import { deactivateImage, setMainImage } from "../../services/productImages/productImages.service";


export const setMainProductImageController = async (
  req: Request,
  res: Response
) => {
  try {
    const { productId, imageId } = req.params as {
      productId: string;
      imageId: string;
    };

    if (!productId || !imageId) {
      return res.status(400).json({
        success: false,
        message: "Faltan parámetros requeridos",
      });
    }

    const image = await setMainImage(productId, imageId);

    return res.status(200).json({
      success: true,
      message: "Imagen principal actualizada correctamente",
      data: image,
    });
  } catch (error: any) {
    console.error("Error setting main product image:", error);

    return res.status(400).json({
      success: false,
      message:
        error?.message || "Error actualizando la imagen principal",
    });
  }
};

export const deactivateProductImageController = async (
  req: Request,
  res: Response
) => {
  try {
    const { productId, imageId } = req.params as { productId: string; imageId: string };

    if (!productId || !imageId) {
      return res.status(400).json({
        success: false,
        message: "Faltan parámetros requeridos",
      });
    }

    const result = await deactivateImage(productId, imageId);

    return res.status(200).json({
      success: true,
      message: "Imagen desactivada correctamente",
      data: result,
    });
  } catch (error: any) {
    console.error("Error deactivating product image:", error);

    return res.status(400).json({
      success: false,
      message:
        error?.message || "Error desactivando la imagen",
    });
  }
};