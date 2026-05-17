import { prisma } from "../../database/db";
import { CreateProductLineInput, UpdateProductLineInput } from "../../schemas/line/productsLines.schema";


type CreateProductLineWithImageInput = CreateProductLineInput & {
  image: string;
};

type UpdateProductLineWithImageInput = UpdateProductLineInput & {
  image?: string;
};

export async function createProductLine(data: CreateProductLineWithImageInput) {
  return prisma.productLine.create({
    data: {
      slug: data.slug,
      name: data.name,
      description: data.description,
      image: data.image,
    },
  });
}

export async function getProductLines() {
  return prisma.productLine.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });
}

export async function getProductLineById(id: string) {
  return prisma.productLine.findUnique({
    where: { id },
    include: {
      products: true,
      _count: {
        select: {
          products: true,
        },
      },
    },
  });
}

export async function getProductLineBySlug(slug: string) {
  return prisma.productLine.findUnique({
    where: { slug },
    include: {
      products: {
        where: {
          isActive: true,
        },
        include: {
          colors: true,
          presentations: true,
        },
      },
    },
  });
}

export async function updateProductLine(
  id: string,
  data: UpdateProductLineWithImageInput
) {
  return prisma.productLine.update({
    where: { id },
    data: {
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.image !== undefined && { image: data.image }),
    },
  });
}

export async function deleteProductLine(id: string) {
  return prisma.productLine.delete({
    where: { id },
  });
}