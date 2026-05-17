import { prisma } from "../../database/db";
import { CreateProductServiceInput } from "../../schemas/products/products.schema";

export async function createProduct(data: CreateProductServiceInput) {
    return prisma.product.create({
        data: {
            slug: data.slug,
            name: data.name,
            description: data.description,
            recommendations: data.recommendations ?? null,
            technicalSheetUrl: data.technicalSheetUrl ?? null,
            productLineId: data.productLineId,

            images: {
                create: data.images.map((image, index) => ({
                    url: image.url,
                    publicId: image.publicId ?? null,
                    alt: image.alt ?? data.name,
                    position: image.position ?? index,
                    isMain: image.isMain ?? index === 0,
                })),
            },

            colors: data.colors?.length
                ? {
                    create: data.colors.map((color) => ({
                        name: color.name ?? null,
                        value: color.value,
                    })),
                }
                : undefined,

            presentations: {
                create: data.presentations.map((presentation) => ({
                    name: presentation.name,
                    price: presentation.price,
                    stock: presentation.stock,
                    sku: presentation.sku ?? null,
                })),
            },
        },
        include: {
            productLine: true,
            images: {
                orderBy: {
                    position: "asc",
                },
            },
            colors: true,
            presentations: true,
        },
    });
}