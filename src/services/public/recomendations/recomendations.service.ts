import { prisma } from "../../../database/db";

function shuffleArray<T>(array: T[]): T[] {
  return array.sort(() => Math.random() - 0.5);
}

export async function getRecommendedProducts() {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    include: {
      productLine: true,
      presentations: true,
      images: {
        where: {
          active: true,
        },
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  const randomProducts = shuffleArray(products).slice(0, 15);

  return {
    type: "RANDOM_PRODUCTS",
    total: randomProducts.length,
    products: randomProducts,
  };
}