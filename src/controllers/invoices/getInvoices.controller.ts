import { getInvoices } from "../../services/invoice/getAllInvoices.service";
import { Request, Response } from "express";

export async function getInvoicesController(req: Request, res: Response) {
  try {
    const invoices = await getInvoices();

    return res.status(200).json({
      ok: true,
      data: invoices,
    });
  } catch (error) {
    console.error("❌ Error obteniendo facturas:", error);

    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
}