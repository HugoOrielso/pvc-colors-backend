import { Router } from "express";
import { createWompiCheckout } from "../../controllers/payments/payments.controller";
import { validate } from "../../middleware/validate.middleware";
import { createWompiCheckoutSchema } from "../../schemas/checkout/checkout.schema";


const checkoutRouter = Router();

checkoutRouter.post("/wompi", validate(createWompiCheckoutSchema),  createWompiCheckout);

export default checkoutRouter;