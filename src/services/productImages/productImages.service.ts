import { prisma } from "../../database/db";

export async function setMainImage(productId: string, imageId: string) {
    const image = await prisma.productImage.findFirst({
        where: {
            id: imageId,
            productId,
            active: true,
        },
    });

    if (!image) {
        throw new Error("Imagen no encontrada o inactiva");
    }

    return prisma.$transaction(async (tx) => {
        await tx.productImage.updateMany({
            where: { productId },
            data: { isMain: false },
        });

        const mainImage = await tx.productImage.update({
            where: { id: imageId },
            data: { isMain: true },
        });

        await tx.product.update({
            where: { id: productId },
            data: { image: mainImage.url },
        });

        return mainImage;
    });
}


export async function deactivateImage(productId: string, imageId: string) {
  const image = await prisma.productImage.findFirst({
    where: {
      id: imageId,
      productId,
      active: true,
    },
  });

  if (!image) {
    throw new Error("Imagen no encontrada");
  }

  return prisma.$transaction(async (tx) => {
    await tx.productImage.update({
      where: { id: imageId },
      data: {
        active: false,
        isMain: false,
      },
    });

    let newMainImage = null;

    if (image.isMain) {
      newMainImage = await tx.productImage.findFirst({
        where: {
          productId,
          active: true,
        },
        orderBy: [
          { position: "asc" },
          { createdAt: "asc" },
        ],
      });

      if (newMainImage) {
        await tx.productImage.update({
          where: { id: newMainImage.id },
          data: { isMain: true },
        });
      }
    }

    await tx.product.update({
      where: { id: productId },
      data: {
        image: newMainImage?.url ?? null,
      },
    });

    return {
      deactivatedImageId: imageId,
      newMainImage,
    };
  });
}