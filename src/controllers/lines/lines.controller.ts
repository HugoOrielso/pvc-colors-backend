import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { createProductLineSchema, updateProductLineSchema } from "../../schemas/line/productsLines.schema";
import { uploadBufferToCloudinary } from "../../utils/cloudinary/upload";
import { createProductLine, deleteProductLine, getProductLineById, getProductLineBySlug, getProductLines, updateProductLine } from "../../services/lines/lines.service";



export async function createProductLineController(
  req: Request,
  res: Response,
) {
  try {

    const validatedData = createProductLineSchema.parse(req.body);
    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({
        message: "La imagen de la línea es obligatoria",
      });
    }

    const imageUrl = await uploadBufferToCloudinary(
      imageFile.buffer,
      "product-lines"
    );

    const productLine = await createProductLine({
      ...validatedData,
      image: imageUrl,
    });

    return res.status(201).json({
      message: "Línea de producto creada correctamente",
      data: productLine,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Error de validación",
        errors: error.issues,
      });
    }

    if (error?.code === "P2002") {
      return res.status(409).json({
        message: "Ya existe una línea con ese slug",
      });
    }

    console.error("createProductLine error:", error);

    return res.status(500).json({
      message: "Error creando línea de producto",
      error: error?.message,
    });
  }
}

export async function getProductLinesController(
  req: Request,
  res: Response,
) {
  try {
    const productLines = await getProductLines();

    return res.json({
      message: "Líneas obtenidas correctamente",
      data: productLines,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error obteniendo líneas de producto",
      error: error?.message,
    });
  }
}

export async function getProductLineByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params as {id: string};

    const productLine = await getProductLineById(id);

    if (!productLine) {
      return res.status(404).json({
        message: "Línea de producto no encontrada",
      });
    }

    return res.json({
      message: "Línea obtenida correctamente",
      data: productLine,
    });
  } catch (error: any) {
    console.error("getProductLineById error:", error);

    return res.status(500).json({
      message: "Error obteniendo línea de producto",
      error: error?.message,
    });
  }
}

export async function getProductLineBySlugController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { slug } = req.params as {slug: string};

    const productLine = await getProductLineBySlug(slug);

    if (!productLine) {
      return res.status(404).json({
        message: "Línea de producto no encontrada",
      });
    }

    return res.json({
      message: "Línea obtenida correctamente",
      data: productLine,
    });
  } catch (error: any) {
    console.error("getProductLineBySlug error:", error);

    return res.status(500).json({
      message: "Error obteniendo línea de producto",
      error: error?.message,
    });
  }
}

export async function updateProductLineController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params as {id:string};

    const validatedData = updateProductLineSchema.parse(req.body);

    const existingProductLine = await getProductLineById(id);

    if (!existingProductLine) {
      return res.status(404).json({
        message: "Línea de producto no encontrada",
      });
    }

    let imageUrl: string | undefined;

    if (req.file) {
      imageUrl = await uploadBufferToCloudinary(
        req.file.buffer,
        "product-lines"
      );
    }

    const productLine = await updateProductLine(id, {
      ...validatedData,
      ...(imageUrl && { image: imageUrl }),
    });

    return res.json({
      message: "Línea de producto actualizada correctamente",
      data: productLine,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Error de validación",
        errors: error.issues,
      });
    }

    if (error?.code === "P2002") {
      return res.status(409).json({
        message: "Ya existe una línea con ese slug",
      });
    }

    console.error("updateProductLine error:", error);

    return res.status(500).json({
      message: "Error actualizando línea de producto",
      error: error?.message,
    });
  }
}

export async function deleteProductLineController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params as {id: string};

    const existingProductLine = await getProductLineById(id);

    if (!existingProductLine) {
      return res.status(404).json({
        message: "Línea de producto no encontrada",
      });
    }

    await deleteProductLine(id);

    return res.json({
      message: "Línea de producto eliminada correctamente",
    });
  } catch (error: any) {
    console.error("deleteProductLine error:", error);

    return res.status(500).json({
      message: "Error eliminando línea de producto",
      error: error?.message,
    });
  }
}