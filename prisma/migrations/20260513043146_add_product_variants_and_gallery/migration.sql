/*
  Warnings:

  - You are about to drop the column `presentation` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `Product` table. All the data in the column will be lost.
  - Added the required column `price` to the `ProductPresentation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ProductPresentation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "presentation",
ADD COLUMN     "presentationId" TEXT,
ADD COLUMN     "presentationName" TEXT;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "price",
DROP COLUMN "stock",
ALTER COLUMN "image" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ProductPresentation" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "price" INTEGER NOT NULL,
ADD COLUMN     "sku" TEXT,
ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT,
    "alt" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductImage_productId_idx" ON "ProductImage"("productId");

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_presentationId_fkey" FOREIGN KEY ("presentationId") REFERENCES "ProductPresentation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
