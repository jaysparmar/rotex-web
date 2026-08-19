-- CreateTable
CREATE TABLE "AttributeValue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attribute" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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
    "industryId" TEXT,
    "subIndustryId" TEXT,
    "industriesServed" TEXT,
    "certificates" JSONB NOT NULL DEFAULT '[]',
    "features" TEXT,
    "specifications" JSONB NOT NULL DEFAULT '[]',
    "downloads" JSONB NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Product_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "SubCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Product_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "Industry" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Product_subIndustryId_fkey" FOREIGN KEY ("subIndustryId") REFERENCES "SubIndustry" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("createdAt", "id", "image", "name", "slug", "updatedAt") SELECT "createdAt", "id", "image", "name", "slug", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_modelNumber_key" ON "Product"("modelNumber");
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE TABLE "new_ProductVariant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "size" TEXT,
    "variantType" TEXT,
    "orifice" TEXT,
    "minOperatingTemp" TEXT,
    "maxOperatingTemp" TEXT,
    "flowFactor" TEXT,
    "certificates" JSONB NOT NULL DEFAULT '[]',
    "features" TEXT,
    "specifications" JSONB NOT NULL DEFAULT '[]',
    "downloads" JSONB NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ProductVariant" ("createdAt", "flowFactor", "id", "orifice", "productId", "size", "updatedAt") SELECT "createdAt", "flowFactor", "id", "orifice", "productId", "size", "updatedAt" FROM "ProductVariant";
DROP TABLE "ProductVariant";
ALTER TABLE "new_ProductVariant" RENAME TO "ProductVariant";
CREATE UNIQUE INDEX "ProductVariant_productId_size_variantType_orifice_minOperatingTemp_maxOperatingTemp_flowFactor_key" ON "ProductVariant"("productId", "size", "variantType", "orifice", "minOperatingTemp", "maxOperatingTemp", "flowFactor");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "AttributeValue_attribute_value_key" ON "AttributeValue"("attribute", "value");

