// services/articles.service.ts
import { prisma } from "../../database/db";
import { CreateArticleInput, UpdateArticleInput } from "../../schemas/articles/articles.schema";


export async function createArticle(data: CreateArticleInput) {
  return prisma.article.create({
    data: {
      title: data.title,
      markdown: data.markdown,
    },
  });
}

export async function updateArticle(id: string, data: UpdateArticleInput) {
  return prisma.article.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.markdown !== undefined && { markdown: data.markdown }),
    },
  });
}

export async function getArticleById(id: string) {
  return prisma.article.findUnique({
    where: { id },
  });
}

export async function getArticles() {
  return prisma.article.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function deleteArticle(id: string) {
  return prisma.article.delete({
    where: { id },
  });
}