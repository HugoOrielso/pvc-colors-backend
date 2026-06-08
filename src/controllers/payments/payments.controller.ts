import { Request, Response } from "express";
import crypto from "crypto";
import { prisma } from "../../database/db";
import { CreateWompiCheckoutInput } from "../../schemas/checkout/checkout.schema";
import { Prisma } from "../../generated/prisma/client";
import { OrderStatus } from "../../generated/prisma/enums";

const wompiLegalIdTypeMap: Record<string, string> = {
  REGISTRO_CIVIL: "RC",
  TARJETA_EXTRANJERIA: "TE",
  CEDULA_CIUDADANIA: "CC",
  CEDULA_EXTRANJERIA: "CE",
  NIT: "NIT",
  PASAPORTE: "PP",
  TARJETA_IDENTIDAD: "TI",
  DNI: "CC",
  CARTEIRA_IDENTIDADE: "CC",
  OTRO: "CC",
};

export async function createWompiCheckout(
  req: Request<unknown, unknown, CreateWompiCheckoutInput>,
  res: Response
) {
  try {
    const { customer, items } = req.body;

    if (!items?.length) {
      return res.status(400).json({
        message: "El carrito no puede estar vacío",
      });
    }

    const productIds = [...new Set(items.map((item) => item.productId))];
    const presentationIds = [...new Set(items.map((item) => item.presentationId))];

    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({
        message: "Uno o más productos no existen o no están activos",
      });
    }

    const presentations = await prisma.productPresentation.findMany({
      where: {
        id: { in: presentationIds },
        active: true,
      },
      include: {
        product: true,
      },
    });

    if (presentations.length !== presentationIds.length) {
      return res.status(400).json({
        message: "Una o más presentaciones no existen o no están activas",
      });
    }

    const productMap = new Map(products.map((product) => [product.id, product]));

    const presentationMap = new Map(
      presentations.map((presentation) => [presentation.id, presentation])
    );

    const normalizedItems = items.map((item) => {
      const product = productMap.get(item.productId);
      const presentation = presentationMap.get(item.presentationId);

      if (!product) {
        throw new Error(`Producto no encontrado: ${item.productId}`);
      }

      if (!presentation) {
        throw new Error(`Presentación no encontrada: ${item.presentationId}`);
      }

      if (presentation.productId !== product.id) {
        throw new Error(
          `La presentación ${presentation.name} no pertenece al producto ${product.name}`
        );
      }

      if (presentation.stock < item.quantity) {
        return {
          error: `Stock insuficiente para ${product.name} - ${presentation.name}`,
        };
      }

      const unitPrice = Number(presentation.price);
      const total = unitPrice * item.quantity;

      return {
        product,
        presentation,
        color: item.color ?? null,
        quantity: item.quantity,
        unitPrice,
        total,
      };
    });

    const stockError = normalizedItems.find((item) => "error" in item);

    if (stockError && "error" in stockError) {
      return res.status(400).json({
        message: stockError.error,
      });
    }

    const safeItems = normalizedItems.filter(
      (
        item
      ): item is Exclude<(typeof normalizedItems)[number], { error: string }> =>
        !("error" in item)
    );

    const subtotal = safeItems.reduce((acc, item) => acc + item.total, 0);
    const total = subtotal;

    if (total <= 0) {
      return res.status(400).json({
        message: "El total de la compra no es válido",
      });
    }

    const privateKey = process.env.WOMPI_PRIVATE_KEY;
    const frontendUrl = process.env.FRONTEND_URL;

    if (!privateKey) {
      return res.status(500).json({
        message: "Falta configurar WOMPI_PRIVATE_KEY",
      });
    }

    if (!frontendUrl) {
      return res.status(500).json({
        message: "Falta configurar FRONTEND_URL",
      });
    }

    const amountInCents = Math.round(total * 100);
    const reference = `ORDER-${Date.now()}-${crypto
      .randomBytes(4)
      .toString("hex")}`;

    console.log("🟡 Intentando crear orden en DB...");


    const order = await prisma.order.create({
      data: {
        orderNumber: reference,
        status: OrderStatus.PENDING_PAYMENT,

        subtotal: new Prisma.Decimal(subtotal),
        tax: new Prisma.Decimal(0),
        shipping: new Prisma.Decimal(0),
        total: new Prisma.Decimal(total),
        currency: "COP",

        customer: {
          create: {
            name: customer.fullName,
            email: customer.email,
            phone: customer.phone,
            document: customer.documentNumber,
            address: customer.address,
          },
        },

        items: {
          create: safeItems.map((item) => ({
            productId: item.product.id,
            presentationId: item.presentation.id,

            productName: item.product.name,
            presentationName: item.presentation.name,
            color: item.color,

            quantity: item.quantity,
            unitPrice: new Prisma.Decimal(item.unitPrice),
            total: new Prisma.Decimal(item.total),
          })),
        },
      },
      include: {
        items: true,
        customer: true,
      },
    });
    console.log("✅ Orden creada:", order.id);

    const wompiBaseUrl = privateKey.startsWith("prv_test_")
      ? "https://sandbox.wompi.co/v1"
      : "https://production.wompi.co/v1";

    const wompiResponse = await fetch(`${wompiBaseUrl}/payment_links`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${privateKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `Pedido ${reference}`,
          description: safeItems
            .map(
              (item) =>
                `${item.product.name} - ${item.presentation.name} x${item.quantity}`
            )
            .join(", "),
          single_use: true,
          collect_shipping: false,
          currency: "COP",
          amount_in_cents: amountInCents,
          redirect_url: `${frontendUrl}/payments/${reference}`,
          reference,
          image_url: null,
          customer_data: {
            email: customer.email,
            full_name: customer.fullName,
            phone_number: customer.phone,
            legal_id: customer.documentNumber,
            legal_id_type: wompiLegalIdTypeMap[customer.documentType] ?? "CC",
          },
        }),
      }
    );

    const wompiData = await wompiResponse.json();

    if (!wompiResponse.ok) {
      console.error("❌ Wompi error:", JSON.stringify(wompiData, null, 2));

      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CANCELLED,
          paymentProvider: "WOMPI",
          paymentReference: reference,
        },
      });

      return res.status(500).json({
        message: "Error creando link de pago en Wompi",
      });
    }

    const paymentLinkId = wompiData?.data?.id;

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentProvider: "WOMPI",
        paymentReference: paymentLinkId ?? reference,
      },
    });

    return res.status(200).json({
      ok: true,
      data: {
        orderId: order.id,
        reference,
        paymentUrl: `https://checkout.wompi.co/l/${paymentLinkId}`,
      },
    });
  } catch (error) {
    console.error("💥 ERROR DETALLADO:", JSON.stringify(error, null, 2));

    console.error("Error creando checkout de Wompi:", error);

    return res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Error interno al iniciar el checkout",
    });
  }
}