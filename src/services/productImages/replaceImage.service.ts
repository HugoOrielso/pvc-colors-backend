import { prisma } from "../../database/db";
import { uploadImageBufferToCloudinaryWithPublicId } from "../../utils/cloudinary/upload";

export async function replaceProductImage(
  productId: string,
  imageId: string,
  file: Express.Multer.File
) {
  if (!file) {
    throw new Error("Debes enviar una imagen");
  }

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

  const uploadedImage = await uploadImageBufferToCloudinaryWithPublicId(
    file.buffer,
    "products/images"
  );

  return prisma.$transaction(async (tx) => {
    const updatedImage = await tx.productImage.update({
      where: { id: imageId },
      data: {
        url: uploadedImage.secureUrl,
        publicId: uploadedImage.publicId,
        alt: file.originalname,
      },
    });

    if (image.isMain) {
      await tx.product.update({
        where: { id: productId },
        data: { image: updatedImage.url },
      });
    }

    return updatedImage;
  });
}