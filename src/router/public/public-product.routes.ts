
import { Router } from "express";
import { getPublicProductById } from "../../controllers/public/products/productById.controller";
import { getRecommendedProductsController } from "../../controllers/public/products/recomendations.controller";

const publicProductRouter = Router();

publicProductRouter.get("/recomendations", getRecommendedProductsController);
publicProductRouter.get("/:id", getPublicProductById);


export default publicProductRouter;