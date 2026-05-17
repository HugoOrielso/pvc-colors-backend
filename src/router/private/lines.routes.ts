import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import {
  createProductSchema,
} from "../../schemas/products/products.schema";

import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { UserRole } from "../../generated/prisma/enums";
import { removeImageFromBody, uploadProductImage } from "../../middleware/uploads.middleware";
import { createProductController } from "../../controllers/products/products.controller";
import { getProductById, getProducts } from "../../services/products/products.service";
import { createProductLineController, getProductLinesController } from "../../controllers/lines/lines.controller";
import { createProductLineSchema } from "../../schemas/line/productsLines.schema";



const linesRouter = Router();

linesRouter.get("/", requireAuth, requireRole(UserRole.ADMIN), getProductLinesController);

linesRouter.post(
  "/",
  requireAuth,
  requireRole(UserRole.ADMIN),
  uploadProductImage.single("image"),
  removeImageFromBody,
  validate(createProductLineSchema, "body"),
  createProductLineController
);

export default linesRouter;