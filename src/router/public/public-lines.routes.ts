import { Router } from "express";
import { getProductLinesController } from "../../controllers/lines/lines.controller";
import { getPublicProductLineByIdController } from "../../controllers/public/lines/productLine.controller";

const publicLinesRouter = Router();

publicLinesRouter.get("/", getProductLinesController);
publicLinesRouter.get("/:id", getPublicProductLineByIdController);


export default publicLinesRouter;