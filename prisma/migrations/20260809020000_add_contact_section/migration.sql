-- CreateTable
CREATE TABLE "ContactSection" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "updatedAt" DATETIME NOT NULL
);
