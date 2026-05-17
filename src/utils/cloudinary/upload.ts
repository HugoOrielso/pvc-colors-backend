// src/utils/uploadToCloudinary.ts

import cloudinary from "../../config/cloudinary";
import { randomUUID } from "node:crypto";


// ============================
// 🔹 UPLOAD PDF
// ============================
export function uploadPdfBufferToCloudinary(
  fileBuffer: Buffer,
  folder = "products/technical-sheets"
): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image", 
        format: "pdf",
        overwrite: false,
      },
      (error, result) => {
        if (error) return reject(error);

        if (!result?.secure_url) {
          return reject(new Error("Cloudinary no devolvió secure_url"));
        }

        resolve(result.secure_url);
      }
    );

    stream.end(fileBuffer);
  });
}


// ============================
// 🔹 UPLOAD IMAGE
// ============================
export function uploadBufferToCloudinary(
  fileBuffer: Buffer,
  folder = "products/images"
): Promise<string> {
  return new Promise((resolve, reject) => {
    const publicId = `${folder}/${randomUUID()}`;

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        public_id: publicId,
        overwrite: false,
        transformation: [
          { quality: "auto", fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) return reject(error);

        if (!result?.secure_url) {
          return reject(new Error("Cloudinary no devolvió secure_url"));
        }

        resolve(result.secure_url);
      }
    );

    stream.on("error", reject);
    stream.end(fileBuffer);
  });
}


// ============================
// 🔹 DELETE IMAGE
// ============================
export async function deleteImageFromCloudinary(publicId: string) {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });
}


// ============================
// 🔹 DELETE PDF (RAW)
// ============================
export async function deleteRawFromCloudinary(publicId: string) {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: "raw",
  });
}


// ============================
// 🔹 EXTRAER PUBLIC ID DESDE URL
// ============================
export function getCloudinaryPublicId(url: string) {
  try {
    const parts = url.split("/upload/");

    if (parts.length < 2) return null;

    const pathWithVersion = parts[1];

    const pathWithoutVersion = pathWithVersion.replace(/^v\d+\//, "");

    return pathWithoutVersion.replace(/\.[^/.]+$/, "");
  } catch {
    return null;
  }
}