import { prisma } from "../../database/db";

export async function getProductLineByIdService(id: string) {
  const line = await prisma.productLine.findUnique({
    where: { id, active: true },
  });

  if (!line) {
    throw new Error("Línea no encontrada");
  }

  return line;
}