import { prisma } from "../../database/db";

export async function getInvoices() {
  return prisma.invoice.findMany({
    orderBy: {
      issuedAt: "desc",
    },
    include: {
      order: {
        include: {
          customer: true,
          items: true,
        },
      },
    },
  });
}