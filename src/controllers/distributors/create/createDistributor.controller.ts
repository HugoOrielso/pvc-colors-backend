// controllers/distributors/distributors.controller.ts
import { Request, Response } from "express";
import { createDistributorSchema } from "../../../schemas/distributors/gistributors.schema";
import { createDistributor } from "../../../services/distributors/distributors.service";


export async function createDistributorController(
  req: Request,
  res: Response
) {
  try {
    const data = createDistributorSchema.parse(req.body);

    const distributor = await createDistributor(data);

    return res.status(201).json({
      ok: true,
      message: "Distribuidor creado correctamente",
      data: distributor,
    });
  } catch (error: any) {
    return res.status(400).json({
      ok: false,
      message:
        error?.errors?.[0]?.message ??
        error?.message ??
        "Error creando el distribuidor",
    });
  }
}






