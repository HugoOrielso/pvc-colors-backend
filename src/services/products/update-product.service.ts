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
        ...(data.coverageMinM2PerGallon !== undefined && {
          coverageMinM2PerGallon: data.coverageMinM2PerGallon,
        }),
        ...(data.coverageMaxM2PerGallon !== undefined && {
          coverageMaxM2PerGallon: data.coverageMaxM2PerGallon,
        }),
        ...(data.productLineId !== undefined && {
          productLineId: data.productLineId,
        }),
        ...(data.technicalSheetUrl !== undefined && {
          technicalSheetUrl: data.technicalSheetUrl,
        }),
      },
    });

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

    if (data.images?.length) {
      const existingImagesCount = data.existingImages?.length ?? 0;

      await tx.productImage.createMany({
        data: data.images.map((image, index) => ({
          productId: id,
          url: image.url,
          publicId: image.publicId ?? null,
          alt: image.alt ?? null,
          position: image.position ?? existingImagesCount + index,
          isMain:
            image.isMain ?? (existingImagesCount === 0 && index === 0),
          active: true,
        })),
      });
    }

    const activeImages = await tx.productImage.findMany({
      where: {
        productId: id,
        active: true,
      },
      orderBy: {
        position: "asc",
      },
    });

    const mainImages = activeImages.filter((image) => image.isMain);

    if (mainImages.length === 0 && activeImages.length > 0) {
      await tx.productImage.update({
        where: { id: activeImages[0].id },
        data: { isMain: true },
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

    if (data.features !== undefined) {
      await tx.productFeature.deleteMany({
        where: { productId: id },
      });

      if (data.features.length > 0) {
        await tx.productFeature.createMany({
          data: data.features.map((feature) => ({
            productId: id,
            name: feature.name,
            description: feature.description ?? null,
          })),
        });
      }
    }

    if (data.colors !== undefined || data.colorGroups !== undefined) {
      await tx.productColor.deleteMany({
        where: { productId: id },
      });

      await tx.productColorGroup.deleteMany({
        where: { productId: id },
      });
    }

    if (data.colors !== undefined && data.colors.length > 0) {
      await tx.productColor.createMany({
        data: data.colors.map((color) => ({
          productId: id,
          name: color.name ?? null,
          value: color.value,
          active: true,
        })),
      });
    }

    if (data.colorGroups !== undefined && data.colorGroups.length > 0) {
      for (const [groupIndex, group] of data.colorGroups.entries()) {
        await tx.productColorGroup.create({
          data: {
            productId: id,
            name: group.name,
            description: group.description ?? null,
            position: groupIndex,
            active: true,
            colors: {
              create: group.colors.map((color) => ({
                productId: id,
                name: color.name ?? null,
                value: color.value,
                active: true,
              })),
            },
          },
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
            stock: presentation.stock ?? 0,
            sku: presentation.sku ?? null,
          })),
        });
      }
    }

    return tx.product.findUniqueOrThrow({
      where: { id },
      include: {
        productLine: true,
        images: {
          where: { active: true },
          orderBy: { position: "asc" },
        },
        colors: {
          where: { active: true },
        },
        colorGroups: {
          where: { active: true },
          orderBy: { position: "asc" },
          include: {
            colors: {
              where: { active: true },
            },
          },
        },
        presentations: true,
        features: true,
      },
    });
  });
}