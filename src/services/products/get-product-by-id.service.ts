import { prisma } from "../../database/db";

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },

    include: {
      productLine: true,

      images: {
        where: {
          active: true
        },
        orderBy: {
          position: "asc",
        },
      },

      colors: {
        where: {
          active: true
        }
      },
      
      presentations: {
        where: {
          active: true
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
}