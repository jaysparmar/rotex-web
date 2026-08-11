import { prisma } from "../src/lib/prisma";

async function main() {
  const section = await prisma.homeSection.findUnique({ where: { key: "certifications" } });
  if (!section) throw new Error('HomeSection "certifications" not found');

  const data = section.data as { title?: string; description?: string; partnerIds?: string[] };
  const ids = data.partnerIds ?? [];

  if (ids.length === 0) {
    console.log("No partnerIds on the certifications section — nothing to migrate.");
    return;
  }

  console.log(`Migrating ${ids.length} rows from Partner to Certification...`);

  for (const id of ids) {
    const partner = await prisma.partner.findUnique({ where: { id } });
    if (!partner) {
      console.warn(`  skip ${id}: not found in Partner`);
      continue;
    }
    await prisma.certification.create({
      data: {
        id: partner.id,
        name: partner.name,
        logo: partner.logo,
        published: partner.published,
      },
    });
    await prisma.partner.delete({ where: { id } });
    console.log(`  moved "${partner.name}" (${id})`);
  }

  await prisma.homeSection.update({
    where: { key: "certifications" },
    data: {
      data: {
        title: data.title,
        description: data.description,
        certificationIds: ids,
      },
    },
  });

  console.log("Updated certifications HomeSection to use certificationIds.");
  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
