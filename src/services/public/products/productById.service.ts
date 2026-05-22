
import { prisma } from "../../../database/db";

export const getPublicProductByIdService = async (id: string) => {
    const product = await prisma.product.findFirst({
        where: { id },
        include: {
            productLine: true,

            images: {
                where: { active: true },
                orderBy: { position: "asc" },
            },

            colors: {
                where: {
                    active: true,
                    groupId: null,
                },
                orderBy: {
                    value: "asc",
                },
            },
            features: true,
            

            colorGroups: {
                where: { active: true },
                orderBy: { position: "asc" },
                include: {
                    colors: {
                        where: { active: true },
                        orderBy: {
                            value: "asc",
                        },
                    },
                },
            },

            presentations: {
                where: { active: true },
                orderBy: { createdAt: "asc" },
            },
        },

    });

    return product;
};