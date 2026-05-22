// controllers/articles.controller.ts
import { Request, Response } from "express";

import {
  createArticle,
  updateArticle,
  getArticleById,
  getArticles,
  deleteArticle,
} from "../../services/articles/articles.service";
import { createArticleSchema, updateArticleSchema } from "../../schemas/articles/articles.schema";

export async function createArticleController(req: Request, res: Response) {
  try {
    const data = createArticleSchema.parse(req.body);

    const article = await createArticle(data);

    return res.status(201).json({
      ok: true,
      message: "Artículo creado correctamente",
      data: article,
    });
  } catch (error: any) {
    return res.status(400).json({
      ok: false,
      message: error?.message ?? "Error creando el artículo",
    });
  }
}

export async function updateArticleController(req: Request, res: Response) {
  try {
    const { id } = req.params as { id: string };
    const data = updateArticleSchema.parse(req.body);

    const article = await updateArticle(id, data);

    return res.json({
      ok: true,
      message: "Artículo actualizado correctamente",
      data: article,
    });
  } catch (error: any) {
    return res.status(400).json({
      ok: false,
      message: error?.message ?? "Error actualizando el artículo",
    });
  }
}

export async function getArticleByIdController(req: Request, res: Response) {
  try {
    const { id } = req.params as { id: string };

    const article = await getArticleById(id);

    if (!article) {
      return res.status(404).json({
        ok: false,
        message: "Artículo no encontrado",
      });
    }

    return res.json({
      ok: true,
      data: article,
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      message: error?.message ?? "Error obteniendo el artículo",
    });
  }
}

export async function getArticlesController(req: Request, res: Response) {
  try {
    const articles = await getArticles();

    return res.json({
      ok: true,
      data: articles,
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      message: error?.message ?? "Error obteniendo artículos",
    });
  }
}

export async function deleteArticleController(req: Request, res: Response) {
  try {
    const { id } = req.params as { id: string };

    await deleteArticle(id);

    return res.json({
      ok: true,
      message: "Artículo eliminado correctamente",
    });
  } catch (error: any) {
    return res.status(400).json({
      ok: false,
      message: error?.message ?? "Error eliminando el artículo",
    });
  }
}