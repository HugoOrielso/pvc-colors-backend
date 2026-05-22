import { prisma } from "../../database/db";
import { CreateProductServiceInput } from "../../schemas/products/products.schema";

export async function createProduct(data: CreateProductServiceInput) {
    return prisma.$transaction(async (tx) => {
        // Step 1: Create product without colorGroups
        const product = await tx.product.create({
            data: {
                slug: data.slug,
                name: data.name,
                description: data.description,
                recommendations: data.recommendations ?? null,
                technicalSheetUrl: data.technicalSheetUrl ?? null,
                coverageMinM2PerGallon: data.coverageMinM2PerGallon ?? null,
                coverageMaxM2PerGallon: data.coverageMaxM2PerGallon ?? null,
                productLineId: data.productLineId,
                features: data.features?.length
                    ? {
                        create: data.features.map((feature) => ({
                            name: feature.name,
                            description: feature.description ?? null,
                        })),
                    }
                    : undefined,

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
                        stock: presentation.stock ?? 0,
                        sku: presentation.sku ?? null,
                    })),
                },
            },
        });


        // Step 2: Create colorGroups with colors now that productId exists
        if (data.colorGroups?.length) {
            for (const [groupIndex, group] of data.colorGroups.entries()) {
                await tx.productColorGroup.create({
                    data: {
                        name: group.name,
                        description: group.description ?? null,
                        productId: product.id, // ✅ now available
                        colors: {
                            create: group.colors.map((color) => ({
                                name: color.name ?? null,
                                value: color.value,
                                productId: product.id, // ✅ required by ProductColor
                            })),
                        },
                    },
                });
            }
        }

        // Step 3: Return full product with all relations
        return tx.product.findUniqueOrThrow({
            where: { id: product.id },
            include: {
                productLine: true,
                images: { orderBy: { position: "asc" } },
                colors: true,
                colorGroups: {
                    orderBy: { position: "asc" },
                    include: { colors: true },
                },
                presentations: true,
                features: true,
            },
        });
    });
}