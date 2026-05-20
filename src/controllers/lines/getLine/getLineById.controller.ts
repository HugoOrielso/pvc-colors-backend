import { Request, Response } from "express";
import { getProductLineByIdService } from "../../../services/lines/getLineById.service";

export async function getProductLineByIdController(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params as { id: string };

    const line = await getProductLineByIdService(id);

    return res.status(200).json({
      success: true,
      data: line,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Error al obtener la línea",
    });
  }
}