import { prisma } from "../../database/db";

export async function getProducts(productLineId?: string) {
  return prisma.product.findMany({
    where: {
      isActive: true,
      ...(productLineId && { productLineId }),
    },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      isActive: true,
      productLineId: true,

      productLine: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}