
import { Router } from "express";
import { getPublicProductById } from "../../controllers/public/products/productById.controller";

const publicProductRouter = Router();

publicProductRouter.get("/:id", getPublicProductById);


export default publicProductRouter;