ALTER TABLE "JobPosting" ADD COLUMN "publishedAt" DATETIME;

-- Backfill: existing published postings get their createdAt as publishedAt
-- (best available approximation since this field didn't exist before).
UPDATE "JobPosting" SET "publishedAt" = "createdAt" WHERE "published" = 1;
