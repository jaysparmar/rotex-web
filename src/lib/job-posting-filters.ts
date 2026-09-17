import { Prisma } from "@/generated/prisma/client";

export type JobPostingFilterParams = {
  q?: string;
  published?: string;
  category?: string;
  location?: string;
  employmentType?: string;
  workMode?: string;
};

export const FILTER_KEYS = [
  "published",
  "category",
  "location",
  "employmentType",
  "workMode",
] as const satisfies readonly (keyof JobPostingFilterParams)[];

export function buildJobPostingWhere(f: JobPostingFilterParams): Prisma.JobPostingWhereInput {
  const where: Prisma.JobPostingWhereInput = {};

  if (f.q) where.OR = [{ title: { contains: f.q } }, { company: { contains: f.q } }];
  if (f.published === "true") where.published = true;
  if (f.published === "false") where.published = false;
  if (f.category) where.category = f.category;
  if (f.location) where.location = f.location;
  if (f.employmentType) where.employmentType = f.employmentType;
  if (f.workMode) where.workMode = f.workMode;

  return where;
}
