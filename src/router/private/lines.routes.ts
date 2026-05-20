import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { UserRole } from "../../generated/prisma/enums";
import { removeImageFromBody, uploadProductImage } from "../../middleware/uploads.middleware";
import { createProductLineSchema } from "../../schemas/line/productsLines.schema";
import { getProductLineByIdController } from "../../controllers/lines/getLine/getLineById.controller";
import { updateProductLineController } from "../../controllers/lines/editLine/updateLine.controller";
import { createProductLineController } from "../../controllers/lines/createLine/createLine.controller";
import { getProductLinesController } from "../../controllers/lines/getLines/getLines.controller";



const linesRouter = Router();

linesRouter.get("/", requireAuth, requireRole(UserRole.ADMIN), getProductLinesController);
linesRouter.get("/:id", requireAuth, requireRole(UserRole.ADMIN), getProductLineByIdController);

linesRouter.post(
  "/",
  requireAuth,
  requireRole(UserRole.ADMIN),
  uploadProductImage.single("image"),
  removeImageFromBody,
  validate(createProductLineSchema, "body"),
  createProductLineController
);


linesRouter.patch(
  "/:id",
  requireAuth,
  requireRole(UserRole.ADMIN),
  uploadProductImage.single("image"),
  removeImageFromBody,
  validate(createProductLineSchema, "body"),
  updateProductLineController
);

export default linesRouter;