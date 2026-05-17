// controllers/productLine.controller.ts

import { Request, Response } from "express";
import { getPublicProductLineByIdService } from "../../../services/public/products/productLines.service";

export const getPublicProductLineByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params as {id: string} ;

    const line = await getPublicProductLineByIdService(id);

    if (!line) {
      return res.status(404).json({
        ok: false,
        message: "Línea no encontrada",
      });
    }

    return res.status(200).json({
      ok: true,
      data: line,
    });
  } catch (error) {
    console.error("Error al obtener línea por id:", error);

    return res.status(500).json({
      ok: false,
      message: "Error interno al obtener la línea",
    });
  }
};