import {Router} from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { getInvoicesController } from "../../controllers/invoices/getInvoices.controller";
import { getInvoiceByIdController } from "../../controllers/invoices/getInvoiceById.controller";

const invoicesRouter = Router();

invoicesRouter.get("/", requireAuth, getInvoicesController)
invoicesRouter.get("/:invoiceNumber", requireAuth, getInvoiceByIdController)

export default invoicesRouter;