import { getInvoiceByInvoiceNumber } from "../../services/public/invoices/getInvoiceByInvoiceNumber.service";
import { Request, Response } from "express";

export async function getInvoiceByIdController(req: Request, res: Response) {
  try {
    const { invoiceNumber } = req.params as { invoiceNumber: string };

    if (!invoiceNumber) {
      return res.status(400).json({
        ok: false,
        message: "El invoiceNumber es obligatorio",
      });
    }

    const invoice = await getInvoiceByInvoiceNumber(invoiceNumber);

    if (!invoice) {
      return res.status(404).json({
        ok: false,
        message: "Factura no encontrada",
      });
    }

    return res.status(200).json({
      ok: true,
      data: invoice,
    });
  } catch (error) {
    console.error("❌ Error obteniendo detalle de factura:", error);

    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
}