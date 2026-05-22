// routes/articles.routes.ts
import { Router } from "express";
import { createArticleController, deleteArticleController, getArticleByIdController, getArticlesController, updateArticleController } from "../../controllers/articles/article.controller";
import { requireAuth } from "../../middleware/auth.middleware";


const articlesRouter = Router();

articlesRouter.post("/", requireAuth, createArticleController);
articlesRouter.get("/", getArticlesController);
articlesRouter.get("/:id", getArticleByIdController);
articlesRouter.put("/:id",  requireAuth, updateArticleController);
articlesRouter.delete("/:id", requireAuth, deleteArticleController);

export default articlesRouter;