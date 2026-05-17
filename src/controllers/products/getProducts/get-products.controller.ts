import { getProducts } from "../../../services/products/get-products.service";
import { type Request, type Response } from "express";

export async function getProductsController(req: Request, res: Response) {
    try {
        const { productLineId } = req.query;

        const products = await getProducts(
            productLineId as string | undefined
        );

        return res.json({
            message: "Productos obtenidos correctamente",
            data: products,
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Error obteniendo productos",
            error: error?.message,
        });
    }
}