import { type Request, type Response } from "express";
import { getDistributorById } from "../../../services/distributors/distributors.service";

export async function getDistributorByIdController(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params as { id: string };

    const distributor = await getDistributorById(id);

    if (!distributor) {
      return res.status(404).json({
        ok: false,
        message: "Distribuidor no encontrado",
      });
    }

    return res.json({
      ok: true,
      data: distributor,
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      message:
        error?.message ?? "Error obteniendo el distribuidor",
    });
  }
}