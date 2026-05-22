import { prisma } from "../../database/db";

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      productLine: true,

      images: {
        where: { active: true },
        orderBy: { position: "asc" },
      },
      features: true,
      colors: {
        where: {
          active: true,
          groupId: null,
        },
        orderBy: {
          value: "asc",
        },
      },

      colorGroups: {
        where: { active: true },
        orderBy: { position: "asc" },
        include: {
          colors: {
            where: { active: true },
            orderBy: {
              value: "asc",
            },
          },
        },
      },

      presentations: {
        where: { active: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}