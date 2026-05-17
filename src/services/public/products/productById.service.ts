
import { prisma } from "../../../database/db";

export const getPublicProductByIdService = async (id: string) => {
    const product = await prisma.product.findFirst({
        where: {
            id,
            isActive: true,
        },
        include: {
            productLine: true,
            colors: {
                where: { active: true },
                orderBy: { name: "asc" },
            },
            presentations: {
                where: { active: true },
                orderBy: { price: "asc" },
            },
            images: {
                where: { active: true },
                orderBy: [{ isMain: "desc" }, { position: "asc" }],
            },
        },
    });

    return product;
};