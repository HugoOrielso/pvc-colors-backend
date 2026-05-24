import { prisma } from "../../../database/db";

export async function getInvoiceByInvoiceNumber(invoiceNumber: string) {
  const order = await prisma.order.findFirst({
    where: {
      OR: [
        {
          orderNumber: invoiceNumber,
        },
        {
          invoice: {
            invoiceNumber,
          },
        },
      ],
    },
    include: {
      customer: true,
      invoice: true,
      items: {
        include: {
          product: {
            include: {
              images: true,
            },
          },
          presentation: true,
        },
      },
    },
  });

  if (!order) {
    return null;
  }

  return {
    id: order.invoice?.id ?? order.id,

    invoiceNumber: order.invoice?.invoiceNumber ?? order.orderNumber,
    orderNumber: order.orderNumber,

    orderStatus: order.status,
    invoiceStatus: order.invoice?.status ?? null,

    paymentProvider: order.paymentProvider,
    paymentReference: order.paymentReference,

    subtotal: order.invoice?.subtotal ?? order.subtotal,
    tax: order.invoice?.tax ?? order.tax,
    shipping: order.invoice?.shipping ?? order.shipping,
    total: order.invoice?.total ?? order.total,
    currency: order.currency,

    issuedAt: order.invoice?.issuedAt ?? null,
    paidAt: order.invoice?.paidAt ?? order.paidAt,

    pdfUrl: order.invoice?.pdfUrl ?? null,

    hasInvoice: Boolean(order.invoice),

    order: {
      ...order,
      invoice: order.invoice,
    },
  };
}