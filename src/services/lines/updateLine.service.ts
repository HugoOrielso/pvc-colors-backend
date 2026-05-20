// services/productLines/updateProductLine.service.ts
import { prisma } from "../../database/db";

type UpdateProductLineInput = {
  slug?: string;
  name?: string;
  description?: string;
  image?: string;
};

export async function updateProductLine(
  id: string,
  data: UpdateProductLineInput
) {
  const productLine = await prisma.productLine.findUnique({
    where: { id },
  });

  if (!productLine) {
    throw new Error("Línea no encontrada");
  }

  return prisma.productLine.update({
    where: { id },
    data,
  });
}