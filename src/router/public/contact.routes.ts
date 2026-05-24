 import { Router } from "express";
import { sendContactEmailController } from "../../controllers/emails/sendContactEmail.controller";

const contactRouter = Router();

contactRouter.post("/", sendContactEmailController);

export default contactRouter;