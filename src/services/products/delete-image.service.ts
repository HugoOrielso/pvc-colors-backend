// services/products/delete-image.service.ts
import { prisma } from "../../database/db";

type DeleteProductImageParams = {
  productId: string;
  imageId: string;
};

export async function deleteProductImage({
  productId,
  imageId,
}: DeleteProductImageParams) {
  const image = await prisma.productImage.findUnique({
    where: {
      id: imageId,
    },
  });

  if (!image) {
    return null;
  }

  if (image.productId !== productId) {
    throw new Error(
      "La imagen no pertenece a este producto"
    );
  }

  // desactivar imagen
  const deletedImage =
    await prisma.productImage.update({
      where: {
        id: imageId,
      },
      data: {
        active: false,
        isMain: false,
      },
    });

  // buscar imágenes activas restantes
  const remainingImages =
    await prisma.productImage.findMany({
      where: {
        productId,
        active: true,
      },
      orderBy: {
        position: "asc",
      },
    });

  // si no hay principal, asignar la primera
  const hasMain = remainingImages.some(
    (img) => img.isMain
  );

  if (!hasMain && remainingImages.length > 0) {
    await prisma.productImage.update({
      where: {
        id: remainingImages[0].id,
      },
      data: {
        isMain: true,
      },
    });
  }

  return deletedImage;
}