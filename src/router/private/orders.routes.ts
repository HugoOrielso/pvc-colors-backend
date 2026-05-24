import { Router } from "express";
import { getOrderByOrderNumberController, getOrdersController } from "../../controllers/orders/orders.controller";
import { requireAuth } from "../../middleware/auth.middleware";

const ordersRouter = Router();

ordersRouter.get("/", requireAuth, getOrdersController);
ordersRouter.get("/:orderNumber", requireAuth, getOrderByOrderNumberController);

export default ordersRouter;