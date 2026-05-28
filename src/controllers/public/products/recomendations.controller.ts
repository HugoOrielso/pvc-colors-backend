import type { Request, Response } from "express";
import { getRecommendedProducts } from "../../../services/public/recomendations/recomendations.service";

export async function getRecommendedProductsController(
  req: Request,
  res: Response
) {
  try {
    const data = await getRecommendedProducts();

    return res.status(200).json({
      ok: true,
      data,
    });
  } catch (error: any) {

    console.error("Error getting recommended products:", error);

    return res.status(500).json({
      ok: false,
      message: error.message || "Error getting recommended products",
    });
  }
}