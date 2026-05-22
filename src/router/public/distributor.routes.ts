import { Router } from "express";
import { getDistributorsController } from "../../controllers/distributors/list/listDistributors.controller";

const publicDistributorsRouter = Router();
publicDistributorsRouter.get("/", getDistributorsController);
export default publicDistributorsRouter;