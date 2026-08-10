"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type JobPostingInput = {
  company: string;
  title: string;
  category: string;
  location: string;
  tag: string;
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
  const created = await prisma.jobPosting.create({ data });
  revalidateJobPostings();
  return created;
}

export async function updateJobPosting(id: string, data: JobPostingInput) {
  await prisma.jobPosting.update({ where: { id }, data });
  revalidateJobPostings();
}

export async function deleteJobPosting(id: string) {
  await prisma.jobPosting.delete({ where: { id } });
  revalidateJobPostings();
}

export async function toggleJobPostingPublished(id: string, published: boolean) {
  await prisma.jobPosting.update({ where: { id }, data: { published } });
  revalidateJobPostings();
}
