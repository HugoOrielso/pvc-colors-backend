import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import {
  createProductSchema,
  updateProductSchema,
} from "../../schemas/products/products.schema";

import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { UserRole } from "../../generated/prisma/enums";
import { removeImageFromBody, uploadProductImage } from "../../middleware/uploads.middleware";
import { getProductByIdController } from "../../controllers/products/products.controller";
import { createProductController } from "../../controllers/products/create/create-product.controller";
import { updateProductController } from "../../controllers/products/update/update-product.controller";
import { getProductsController } from "../../controllers/products/getProducts/get-products.controller";
import { deleteImageController } from "../../controllers/products/deleteImage/delete-image.controller";
import { deleteColorController } from "../../controllers/products/deleteColor/deleteColor.controller";
import { deactivateProductImageController, setMainProductImageController } from "../../controllers/productImages/productImages.controller";
import { replaceProductImageController } from "../../controllers/productImages/replaceImage.controller";


const productsRouter = Router();

productsRouter.get("/", requireAuth, requireRole(UserRole.ADMIN), getProductsController);
productsRouter.get("/:id", requireAuth, requireRole(UserRole.ADMIN), getProductByIdController);
productsRouter.delete("/:id/image/:imageId", requireAuth, requireRole(UserRole.ADMIN), deleteImageController);
productsRouter.delete("/:id/color/:colorId", requireAuth, requireRole(UserRole.ADMIN), deleteColorController);
productsRouter.post(
  "/",
  requireAuth,
  requireRole(UserRole.ADMIN),
  uploadProductImage.fields([
    { name: "images", maxCount: 10 },
    { name: "technicalSheet", maxCount: 1 },
  ]),
  removeImageFromBody,
  validate(createProductSchema, "body"),
  createProductController
);

productsRouter.patch(
  "/:id",
  requireAuth,
  requireRole(UserRole.ADMIN),
  uploadProductImage.fields([
    { name: "images", maxCount: 10 },
    { name: "technicalSheet", maxCount: 1 },
  ]),
  removeImageFromBody,
  validate(updateProductSchema, "body"),
  updateProductController
);

productsRouter.patch(
  "/:productId/images/:imageId/main",
  requireAuth,
  requireRole(UserRole.ADMIN),
  setMainProductImageController
);

productsRouter.patch(
  "/:productId/images/:imageId/deactivate",
  requireAuth,
  requireRole(UserRole.ADMIN),
  deactivateProductImageController
);

productsRouter.patch(
  "/:productId/images/:imageId/replace",
  requireAuth,
  requireRole(UserRole.ADMIN),
  uploadProductImage.single("image"),
  replaceProductImageController
);

export default productsRouter;