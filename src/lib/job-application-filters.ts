import { Prisma } from "@/generated/prisma/client";

export type JobApplicationFilterParams = {
  q?: string;
  position?: string;
  location?: string;
};

export const FILTER_KEYS = ["position", "location"] as const satisfies readonly (keyof JobApplicationFilterParams)[];

export function buildJobApplicationWhere(f: JobApplicationFilterParams): Prisma.JobApplicationWhereInput {
  const where: Prisma.JobApplicationWhereInput = {};

  if (f.q) where.OR = [{ fullName: { contains: f.q } }, { email: { contains: f.q } }];
  if (f.position) where.position = f.position;
  if (f.location) where.location = f.location;

  return where;
}
