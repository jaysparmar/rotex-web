-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN "image" TEXT;

-- CreateTable
CREATE TABLE "ImageImportJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "zipPath" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "totalBytes" INTEGER NOT NULL DEFAULT 0,
    "uploadedBytes" INTEGER NOT NULL DEFAULT 0,
    "references" JSONB NOT NULL DEFAULT '[]',
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "processedItems" INTEGER NOT NULL DEFAULT 0,
    "copiedCount" INTEGER NOT NULL DEFAULT 0,
    "resolved" JSONB NOT NULL DEFAULT '{}',
    "missing" JSONB NOT NULL DEFAULT '[]',
    "error" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
