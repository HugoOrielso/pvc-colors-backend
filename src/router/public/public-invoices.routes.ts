import { Router } from "express";

import { getInvoiceDetailController } from "../../controllers/public/invoices/invoices.controller";

const publicInvoicesRouter = Router();

publicInvoicesRouter.get("/:invoiceNumber", getInvoiceDetailController);

export default publicInvoicesRouter;