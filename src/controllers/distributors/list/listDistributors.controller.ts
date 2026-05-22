import { type Request, type Response } from "express";
import { getDistributors } from "../../../services/distributors/distributors.service";

export async function getDistributorsController(
  req: Request,
  res: Response
) {
  try {
    const distributors = await getDistributors();

    return res.json({
      ok: true,
      data: distributors,
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      message:
        error?.message ?? "Error obteniendo los distribuidores",
    });
  }
}