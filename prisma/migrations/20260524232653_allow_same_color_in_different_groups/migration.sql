/*
  Warnings:

  - A unique constraint covering the columns `[productId,groupId,value]` on the table `ProductColor` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ProductColor_productId_value_key";

-- CreateIndex
CREATE UNIQUE INDEX "ProductColor_productId_groupId_value_key" ON "ProductColor"("productId", "groupId", "value");
