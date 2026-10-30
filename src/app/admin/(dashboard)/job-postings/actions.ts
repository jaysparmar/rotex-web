"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type JobPostingInput = {
  company: string;
  title: string;
  category: string;
  location: string;
  tags: string[];
  employmentType: string;
  workMode: string;
  aboutRole: string;
  whatYouDo: string[];
  whatWeLookFor: string[];
  whatYouGet: { icon: string; label: string }[];
  published: boolean;
};

function revalidateJobPostings() {
  revalidatePath("/admin/job-postings");
  revalidatePath("/join/career");
}

export async function createJobPosting(data: JobPostingInput) {
  const created = await prisma.jobPosting.create({
    data: { ...data, publishedAt: data.published ? new Date() : null },
  });
  revalidateJobPostings();
  return created;
}

export async function updateJobPosting(id: string, data: JobPostingInput) {
  // Only stamp publishedAt the first time a posting goes live — re-saving an
  // already-published posting (editing copy, toggling a tag) shouldn't bump
  // its "Posted" date on the careers page.
  const existing = await prisma.jobPosting.findUnique({ where: { id }, select: { publishedAt: true } });
  const publishedAt = data.published ? (existing?.publishedAt ?? new Date()) : existing?.publishedAt ?? null;
  await prisma.jobPosting.update({ where: { id }, data: { ...data, publishedAt } });
  revalidateJobPostings();
}

export async function deleteJobPosting(id: string) {
  await prisma.jobPosting.delete({ where: { id } });
  revalidateJobPostings();
}

export async function toggleJobPostingPublished(id: string, published: boolean) {
  const existing = await prisma.jobPosting.findUnique({ where: { id }, select: { publishedAt: true } });
  const publishedAt = published ? (existing?.publishedAt ?? new Date()) : existing?.publishedAt ?? null;
  await prisma.jobPosting.update({ where: { id }, data: { published, publishedAt } });
  revalidateJobPostings();
}
