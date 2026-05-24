import { Request, Response } from "express";
import { getOrderByOrderNumber, getOrders } from "../../services/invoice/getOrders.service";


export async function getOrdersController(req: Request, res: Response) {
    try {
        const orders = await getOrders();

        return res.status(200).json({
            success: true,
            data: orders,
            message: "Órdenes obtenidas correctamente",
        });
    } catch (error) {
        console.error("Error obteniendo órdenes:", error);

        return res.status(500).json({
            success: false,
            message: "Error obteniendo órdenes",
        });
    }
}

export async function getOrderByOrderNumberController(
    req: Request,
    res: Response
) {
    try {
        const { orderNumber } = req.params as { orderNumber: string };

        if (!orderNumber) {
            return res.status(400).json({
                success: false,
                message: "El número de orden es obligatorio",
            });
        }

        const order = await getOrderByOrderNumber(orderNumber);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Orden no encontrada",
            });
        }

        return res.status(200).json({
            success: true,
            data: order,
            message: "Orden obtenida correctamente",
        });
    } catch (error) {
        console.error("Error obteniendo orden:", error);

        return res.status(500).json({
            success: false,
            message: "Error obteniendo orden",
        });
    }
}