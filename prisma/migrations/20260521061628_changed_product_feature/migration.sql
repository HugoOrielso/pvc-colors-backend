/*
  Warnings:

  - A unique constraint covering the columns `[productId,name]` on the table `ProductFeature` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ProductFeature_productId_key";

-- CreateIndex
CREATE INDEX "ProductFeature_productId_idx" ON "ProductFeature"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductFeature_productId_name_key" ON "ProductFeature"("productId", "name");
