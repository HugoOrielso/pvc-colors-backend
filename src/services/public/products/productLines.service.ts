// services/productLine.service.ts

import { prisma } from "../../../database/db";

export const getPublicProductLineByIdService = async (id: string) => {
  const line = await prisma.productLine.findUnique({
    where: { id },

    include: {
      products: {
        where: {
          isActive: true,
        },

        orderBy: {
          createdAt: "desc",
        },

        include: {
          colorGroups: {
            where: {
              active: true,
            },

            include: {
              colors: {
                where: {
                  active: true,
                },
              },
            },
          },

          presentations: {
            where: {
              active: true,
            },
          },

          images: {
            where: {
              active: true,
              isMain: true,
            },

            orderBy: {
              position: "asc",
            },

            take: 1,
          },
        },
      },

      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  return line;
};