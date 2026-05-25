import { Request, Response } from "express";
import { InvoiceStatus, OrderStatus } from "../../generated/prisma/enums";
import { prisma } from "../../database/db";
import { WompiWebhookPayload } from "../../types/wompi";
import { validateWompiWebhook } from "../../utils/wompi/utilsWompi";

const mapOrderStatus = (status: string): OrderStatus => {
  switch (status) {
    case "APPROVED":
      return OrderStatus.PAID;

    case "DECLINED":
    case "VOIDED":
    case "CANCELLED":
    case "ERROR":
    case "EXPIRED":
      return OrderStatus.CANCELLED;

    default:
      return OrderStatus.PENDING_PAYMENT;
  }
};

export async function wompiWebhook(req: Request, res: Response) {
  try {
    const payload = req.body as WompiWebhookPayload;
    const eventsSecret = process.env.WOMPI_EVENTS_SECRET?.trim();

    if (!eventsSecret) {
      return res.status(500).json({ error: "Webhook no configurado" });
    }

    const isValid = validateWompiWebhook(payload, eventsSecret);

    if (!isValid) {
      console.error("❌ Firma inválida de Wompi");
      return res.status(401).json({ error: "Invalid signature" });
    }

    if (payload.event !== "transaction.updated") {
      return res.status(200).json({ ok: true, ignored: true });
    }
    const transaction = payload.data?.transaction;

    if (!transaction) {
      return res.status(400).json({ error: "Transaction no encontrada" });
    }

    const wompiStatus = transaction.status ?? "PENDING";
    const nextOrderStatus = mapOrderStatus(wompiStatus);
    const wompiTransactionId = transaction.id ?? null;
    const wompiReference = transaction.reference ?? null;

    let orderReference: string | null = wompiReference;

    if (transaction.redirect_url) {
      try {
        const url = new URL(transaction.redirect_url);
        const pathSegments = url.pathname.split("/").filter(Boolean);
        const refFromPath = pathSegments[pathSegments.length - 1] ?? null;

        if (refFromPath) {
          orderReference = decodeURIComponent(refFromPath);
        }
      } catch (error) {
        console.warn("⚠️ No se pudo parsear redirect_url:", error);
      }
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(orderReference ? [{ orderNumber: orderReference }] : []),
          ...(wompiReference ? [{ orderNumber: wompiReference }] : []),
          ...(wompiReference ? [{ paymentReference: wompiReference }] : []),
          ...(wompiTransactionId ? [{ paymentReference: wompiTransactionId }] : []),
        ],
      },
      include: {
        items: true,
        invoice: true,
      },
    });

    if (!order) {
      return res.status(200).json({
        ok: true,
        warning: "order_not_found",
      });
    }

 const isApproved = wompiStatus === "APPROVED";

await prisma.$transaction(async (tx) => {
  // 1. Siempre guardar estado de la orden
  await tx.order.update({
    where: { id: order.id },
    data: {
      status: nextOrderStatus,
      paymentProvider: "WOMPI",
      paymentReference: wompiTransactionId ?? wompiReference,
      paidAt: isApproved ? order.paidAt ?? new Date() : order.paidAt,
    },
  });

  // 2. Si NO fue aprobado, no crear factura ni descontar stock
  if (!isApproved) {
    return;
  }

  // 3. Si ya tiene factura, no repetir proceso
  if (order.invoice) {
    return;
  }

  // 4. Validar stock
  for (const item of order.items) {
    if (!item.presentationId) continue;

    const presentation = await tx.productPresentation.findUnique({
      where: { id: item.presentationId },
    });

    if (!presentation) {
      throw new Error(`Presentación no encontrada: ${item.presentationId}`);
    }

    if (presentation.stock < item.quantity) {
      throw new Error(
        `Stock insuficiente para presentación ${item.presentationId}`
      );
    }
  }

  // 5. Crear factura pagada
  await tx.invoice.create({
    data: {
      invoiceNumber: order.orderNumber,
      orderId: order.id,
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      total: order.total,
      status: InvoiceStatus.PAID,
      paidAt: new Date(),
    },
  });

  // 6. Descontar stock
  for (const item of order.items) {
    if (!item.presentationId) continue;

    await tx.productPresentation.update({
      where: { id: item.presentationId },
      data: {
        stock: {
          decrement: item.quantity,
        },
      },
    });
  }
});

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("❌ Error en webhook de Wompi:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}