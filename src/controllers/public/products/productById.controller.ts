import { Request, Response } from "express";
import { getPublicProductByIdService } from "../../../services/public/products/productById.service";

export const getPublicProductById = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params as {id: string} ;

    const line = await getPublicProductByIdService(id);

    if (!line) {
      return res.status(404).json({
        ok: false,
        message: "Producto no encontrado",
      });
    }

    return res.status(200).json({
      ok: true,
      data: line,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error interno al obtener la línea",
    });
  }
};