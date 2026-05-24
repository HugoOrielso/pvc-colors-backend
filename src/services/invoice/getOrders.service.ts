import { prisma } from "../../database/db";

export async function getOrders() {
  return prisma.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      customer: true,
      items: true,
      invoice: true,
    },
  });
}

export async function getOrderByOrderNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: {
      orderNumber,
    },
    include: {
      customer: true,
      items: {
        include: {
          product: true,
          presentation: true,
        },
      },
      invoice: true,
    },
  });
}