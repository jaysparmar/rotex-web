ALTER TABLE "Resource" ADD COLUMN "productIds" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "Resource" ADD COLUMN "industryIds" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "Resource" DROP COLUMN "product";
ALTER TABLE "Resource" DROP COLUMN "industry";
