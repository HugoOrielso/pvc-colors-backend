import { type Request, type Response } from "express";
import { deleteDistributor } from "../../../services/distributors/distributors.service";

export async function deleteDistributorController(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params as { id: string };

    await deleteDistributor(id);

    return res.json({
      ok: true,
      message: "Distribuidor eliminado correctamente",
    });
  } catch (error: any) {
    return res.status(400).json({
      ok: false,
      message:
        error?.message ?? "Error eliminando el distribuidor",
    });
  }
}