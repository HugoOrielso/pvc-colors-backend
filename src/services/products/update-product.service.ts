import { prisma } from "../../database/db";
import { UpdateProductServiceInput } from "../../schemas/products/products.schema";

export async function updateProduct(
  id: string,
  data: UpdateProductServiceInput
) {
  return prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: {
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.recommendations !== undefined && {
          recommendations: data.recommendations || null,
        }),
        ...(data.productLineId !== undefined && {
          productLineId: data.productLineId,
        }),
        ...(data.technicalSheetUrl !== undefined && {
          technicalSheetUrl: data.technicalSheetUrl,
        }),
      },
    });

    // actualizar imágenes existentes, NO borrarlas
    if (data.existingImages !== undefined) {
      await Promise.all(
        data.existingImages.map((image) =>
          tx.productImage.updateMany({
            where: {
              id: image.id,
              productId: id,
            },
            data: {
              alt: image.alt ?? null,
              position: image.position ?? 0,
              isMain: image.isMain ?? false,
              active: true,
            },
          })
        )
      );
    }

    // crear solo imágenes nuevas
    if (data.images !== undefined && data.images.length > 0) {
      const existingImagesCount =
        data.existingImages?.length ?? 0;

      await tx.productImage.createMany({
        data: data.images.map((image, index) => ({
          productId: id,
          url: image.url,
          publicId: image.publicId ?? null,
          alt: image.alt ?? null,
          position:
            image.position ?? existingImagesCount + index,
          isMain:
            image.isMain ??
            (existingImagesCount === 0 && index === 0),
          active: true,
        })),
      });
    }

    // asegurar una sola imagen principal
    const activeImages = await tx.productImage.findMany({
      where: {
        productId: id,
        active: true,
      },
      orderBy: {
        position: "asc",
      },
    });

    const mainImages = activeImages.filter(
      (image) => image.isMain
    );

    if (mainImages.length === 0 && activeImages.length > 0) {
      await tx.productImage.update({
        where: {
          id: activeImages[0].id,
        },
        data: {
          isMain: true,
        },
      });
    }

    if (mainImages.length > 1) {
      const [, ...rest] = mainImages;

      await tx.productImage.updateMany({
        where: {
          id: {
            in: rest.map((image) => image.id),
          },
        },
        data: {
          isMain: false,
        },
      });
    }

    if (data.colors !== undefined) {
      await tx.productColor.deleteMany({
        where: { productId: id },
      });

      if (data.colors.length > 0) {
        await tx.productColor.createMany({
          data: data.colors.map((color) => ({
            productId: id,
            name: color.name ?? null,
            value: color.value,
          })),
        });
      }
    }

    if (data.presentations !== undefined) {
      await tx.productPresentation.deleteMany({
        where: { productId: id },
      });

      if (data.presentations.length > 0) {
        await tx.productPresentation.createMany({
          data: data.presentations.map((presentation) => ({
            productId: id,
            name: presentation.name,
            price: presentation.price,
            stock: presentation.stock,
            sku: presentation.sku ?? null,
          })),
        });
      }
    }

    return tx.product.findUnique({
      where: { id },
      include: {
        productLine: true,
        images: {
          where: {
            active: true,
          },
          orderBy: {
            position: "asc",
          },
        },
        colors: {
          where: {
            active: true,
          },
        },
        presentations: true,
      },
    });
  });
}