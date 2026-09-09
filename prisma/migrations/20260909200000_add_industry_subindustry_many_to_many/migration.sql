-- AlterTable
ALTER TABLE "Industry" ADD COLUMN "importReference" TEXT;

-- AlterTable
ALTER TABLE "SubIndustry" ADD COLUMN "importReference" TEXT;

-- CreateTable
CREATE TABLE "_ProductToSubIndustry" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ProductToSubIndustry_A_fkey" FOREIGN KEY ("A") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ProductToSubIndustry_B_fkey" FOREIGN KEY ("B") REFERENCES "SubIndustry" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ProductVariantToSubIndustry" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ProductVariantToSubIndustry_A_fkey" FOREIGN KEY ("A") REFERENCES "ProductVariant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ProductVariantToSubIndustry_B_fkey" FOREIGN KEY ("B") REFERENCES "SubIndustry" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_IndustryToProduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_IndustryToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "Industry" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_IndustryToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_IndustryToProductVariant" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_IndustryToProductVariant_A_fkey" FOREIGN KEY ("A") REFERENCES "Industry" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_IndustryToProductVariant_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductVariant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Backfill existing single-value Product.industryId / Product.subIndustryId assignments
-- into the new join tables before the old scalar columns are dropped below.
INSERT INTO "_IndustryToProduct" ("A", "B")
SELECT "industryId", "id" FROM "Product" WHERE "industryId" IS NOT NULL;

INSERT INTO "_ProductToSubIndustry" ("A", "B")
SELECT "id", "subIndustryId" FROM "Product" WHERE "subIndustryId" IS NOT NULL;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "modelNumber" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "productFamily" TEXT NOT NULL,
    "productType" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "subCategoryId" TEXT,
    "certificates" JSONB NOT NULL DEFAULT [],
    "features" TEXT,
    "description" TEXT,
    "specifications" JSONB NOT NULL DEFAULT [],
    "downloads" JSONB NOT NULL DEFAULT [],
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Product_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "SubCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("categoryId", "certificates", "companyId", "createdAt", "description", "downloads", "features", "id", "image", "modelNumber", "name", "productFamily", "productType", "slug", "specifications", "subCategoryId", "updatedAt") SELECT "categoryId", "certificates", "companyId", "createdAt", "description", "downloads", "features", "id", "image", "modelNumber", "name", "productFamily", "productType", "slug", "specifications", "subCategoryId", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_modelNumber_key" ON "Product"("modelNumber");
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_ProductToSubIndustry_AB_unique" ON "_ProductToSubIndustry"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductToSubIndustry_B_index" ON "_ProductToSubIndustry"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProductVariantToSubIndustry_AB_unique" ON "_ProductVariantToSubIndustry"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductVariantToSubIndustry_B_index" ON "_ProductVariantToSubIndustry"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_IndustryToProduct_AB_unique" ON "_IndustryToProduct"("A", "B");

-- CreateIndex
CREATE INDEX "_IndustryToProduct_B_index" ON "_IndustryToProduct"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_IndustryToProductVariant_AB_unique" ON "_IndustryToProductVariant"("A", "B");

-- CreateIndex
CREATE INDEX "_IndustryToProductVariant_B_index" ON "_IndustryToProductVariant"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Industry_importReference_key" ON "Industry"("importReference");

-- CreateIndex
CREATE UNIQUE INDEX "SubIndustry_importReference_key" ON "SubIndustry"("importReference");
