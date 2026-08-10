-- CreateTable
CREATE TABLE "DownloadItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tab" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'English',
    "fileType" TEXT NOT NULL DEFAULT 'PDF',
    "fileSizeLabel" TEXT NOT NULL DEFAULT '',
    "fileUrl" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "product" TEXT NOT NULL DEFAULT '',
    "subCategory" TEXT NOT NULL DEFAULT '',
    "productCertificateType" TEXT NOT NULL DEFAULT '',
    "qmsCertificateType" TEXT NOT NULL DEFAULT '',
    "industry" TEXT NOT NULL DEFAULT '',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
