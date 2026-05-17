// src/controllers/products/product.controller.ts
import { NextFunction, Request, Response } from "express";
import { activateProduct, deactivateProduct, deleteProduct, getProductBySlug, getProductsAdmin } from "../../services/products/products.service";
import { getProductById } from "../../services/products/get-product-by-id.service";


export async function getProductByIdController(req: Request, res: Response) {
    try {
        const { id } = req.params as { id: string };

        const product = await getProductById(id);

        if (!product) {
            return res.status(404).json({
                message: "Producto no encontrado",
            });
        }

        return res.status(200).json({
            data: product,
        });
    } catch (error) {
        console.error("Error obteniendo producto por ID:", error);

        return res.status(500).json({
            message: "Error al obtener el producto",
        });
    }
}

export async function getProductBySlugController(req: Request, res: Response) {
    try {
        const { slug } = req.params as { slug: string };

        const product = await getProductBySlug(slug);

        if (!product) {
            return res.status(404).json({
                message: "Producto no encontrado",
            });
        }

        return res.status(200).json({
            data: product,
        });
    } catch (error) {
        console.error("Error obteniendo producto por slug:", error);

        return res.status(500).json({
            message: "Error al obtener el producto",
        });
    }
}

function parseJsonArray<T>(value: unknown): T[] | undefined {
    if (Array.isArray(value)) return value as T[];

    if (typeof value !== "string") return undefined;

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? (parsed as T[]) : undefined;
    } catch {
        return undefined;
    }
}


export async function deactivateProductController(req: Request, res: Response) {
    try {
        const { id } = req.params as { id: string };

        const product = await deactivateProduct(id);

        return res.status(200).json({
            message: "Producto desactivado correctamente",
            data: product,
        });
    } catch (error) {
        console.error("Error desactivando producto:", error);

        return res.status(500).json({
            message: "Error al desactivar el producto",
        });
    }
}

export async function activateProductController(req: Request, res: Response) {
    try {
        const { id } = req.params as { id: string };

        const product = await activateProduct(id);

        return res.status(200).json({
            message: "Producto activado correctamente",
            data: product,
        });
    } catch (error) {
        console.error("Error activando producto:", error);

        return res.status(500).json({
            message: "Error al activar el producto",
        });
    }
}

export async function deleteProductController(req: Request, res: Response) {
    try {
        const { id } = req.params as { id: string };

        await deleteProduct(id);

        return res.status(200).json({
            message: "Producto eliminado correctamente",
        });
    } catch (error) {
        console.error("Error eliminando producto:", error);

        return res.status(500).json({
            message: "Error al eliminar el producto",
        });
    }
}