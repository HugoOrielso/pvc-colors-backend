import { Router } from "express";
import { getPublicProductLineByIdController } from "../../controllers/public/lines/productLine.controller";
import { getProductLinesController } from "../../controllers/public/lines/getLines/getLines.controller";

const publicLinesRouter = Router();

publicLinesRouter.get("/", getProductLinesController);
publicLinesRouter.get("/:id", getPublicProductLineByIdController);


export default publicLinesRouter;