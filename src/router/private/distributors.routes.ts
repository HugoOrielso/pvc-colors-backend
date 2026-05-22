// routes/distributors.routes.ts
import { Router } from "express";
import { getDistributorsController } from "../../controllers/distributors/list/listDistributors.controller";
import { getDistributorByIdController } from "../../controllers/distributors/getDistributorById/getDistributorById.controller";
import { createDistributorController } from "../../controllers/distributors/create/createDistributor.controller";
import { updateDistributorController } from "../../controllers/distributors/edit/editDistributor.controller";
import { deleteDistributorController } from "../../controllers/distributors/deleteDistributors/deleteDistributor.controller";
import { requireAuth } from "../../middleware/auth.middleware";


const distributorsRouter = Router();

distributorsRouter.get("/", requireAuth, getDistributorsController);
distributorsRouter.get("/", getDistributorsController);
distributorsRouter.get("/:id", requireAuth, getDistributorByIdController);
distributorsRouter.post("/", requireAuth, createDistributorController);
distributorsRouter.put("/:id", requireAuth, updateDistributorController);
distributorsRouter.delete("/:id", requireAuth, deleteDistributorController);

export default distributorsRouter;