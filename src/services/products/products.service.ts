// src/services/products/product.service.ts
import { prisma } from "../../database/db";
import { CreateProductInput, CreateProductServiceInput, UpdateProductInput } from "../../schemas/products/products.schema";


function formatPrice(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export async function getProductsAdmin() {
  return prisma.product.findMany({
    include: productInclude,
    orderBy: {
      createdAt: "desc",
    },
  });
}



export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: productInclude,
  });
}


export async function updateProduct(id: string, data: UpdateProductInput) {
  return prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: {
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.recommendations !== undefined && {
          recommendations: data.recommendations,
        }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.stock !== undefined && { stock: data.stock }),
        ...(data.productLineId !== undefined && {
          productLineId: data.productLineId,
        }),
        ...(data.image !== undefined && { image: data.image }),
        ...(data.technicalSheetUrl !== undefined && {
          technicalSheetUrl: data.technicalSheetUrl,
        }),
      },
    });

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
          })),
        });
      }
    }

    return tx.product.findUnique({
      where: { id },
      include: productInclude,
    });
  });
}


export async function deactivateProduct(id: string) {
  return prisma.product.update({
    where: { id },
    data: {
      isActive: false,
    },
  });
}

export async function activateProduct(id: string) {
  return prisma.product.update({
    where: { id },
    data: {
      isActive: true,
    },
  });
}

export async function deleteProduct(id: string) {
  return prisma.product.delete({
    where: { id },
  });
}

export const productInclude = {
  productLine: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },

  colors: {
    select: {
      id: true,
      name: true,
      value: true,
    },
  },

  presentations: {
    select: {
      id: true,
      name: true,
      price: true,
      stock: true,
      sku: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  },

  images: {
    select: {
      id: true,
      url: true,
      publicId: true,
      alt: true,
      position: true,
      isMain: true,
    },
    orderBy: {
      position: "asc",
    },
  },
};