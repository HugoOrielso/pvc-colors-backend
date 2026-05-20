import { type Request, type Response } from "express";
import { getProductLines } from "../../../../services/lines/lines.service";

export async function getProductLinesController(
  req: Request,
  res: Response,
) {
  try {
    const productLines = await getProductLines();

    return res.json({
      message: "Líneas obtenidas correctamente",
      data: productLines,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error obteniendo líneas de producto",
      error: error?.message,
    });
  }
}