import { type Request, type Response } from "express";
import { updateDistributorSchema } from "../../../schemas/distributors/gistributors.schema";
import { updateDistributor } from "../../../services/distributors/distributors.service";

export async function updateDistributorController(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params as { id: string };
    const data = updateDistributorSchema.parse(req.body);

    const distributor = await updateDistributor(id, data);

    return res.json({
      ok: true,
      message: "Distribuidor actualizado correctamente",
      data: distributor,
    });
  } catch (error: any) {
    return res.status(400).json({
      ok: false,
      message:
        error?.errors?.[0]?.message ??
        error?.message ??
        "Error actualizando el distribuidor",
    });
  }
}