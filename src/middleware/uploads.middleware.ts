import { Request, Response, NextFunction } from "express";
import multer from "multer";

export const uploadProductImage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export function removeImageFromBody(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  if ("image" in req.body) {
    delete req.body.image;
  }

  if ("images" in req.body) {
    delete req.body.images;
  }

  if ("imageUrl" in req.body && !req.body.imageUrl) {
    delete req.body.imageUrl;
  }

  next();
}