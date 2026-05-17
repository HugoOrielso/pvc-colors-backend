// services/products/delete-product-color.service.ts

import { prisma } from "../../database/db";

type DeleteProductColorParams = {
    productId: string;
    colorId: string;
};

export async function deleteProductColor({
    productId,
    colorId,
}: DeleteProductColorParams) {
    const color = await prisma.productColor.findUnique({
        where: {
            id: colorId,
        },
    });

    if (!color) return null;

    if (color.productId !== productId) {
        throw new Error("El color no pertenece a este producto");
    }

    return prisma.productColor.update({
        where: {
            id: colorId,
        },
        data: {
            active: false,
        },
    });
}