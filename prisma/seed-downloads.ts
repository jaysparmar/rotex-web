import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!.replace(/^file:/, ""),
});
const prisma = new PrismaClient({ adapter });

const SAMPLE_PDF = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
const IMG = "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&q=80";

type SeedDownload = {
  tab: string;
  title: string;
  language: string;
  fileType: string;
  fileSizeLabel: string;
  product: string;
  subCategory: string;
  productCertificateType: string;
  qmsCertificateType: string;
  industry: string;
};

const DOWNLOADS: SeedDownload[] = [
  { tab: "certificates", title: "CE Certificate — Solenoid Valve Series", language: "English", fileType: "PDF", fileSizeLabel: "1.2 MB", product: "Solenoid Valve", subCategory: "2/2 Way", productCertificateType: "CE Certificate", qmsCertificateType: "", industry: "Oil & Gas" },
  { tab: "certificates", title: "ATEX Certificate — Actuator Range", language: "English", fileType: "PDF", fileSizeLabel: "980 KB", product: "Actuators", subCategory: "Direct Acting", productCertificateType: "ATEX Certificate", qmsCertificateType: "", industry: "Process" },
  { tab: "certificates", title: "ISO 9001 Quality Management Certificate", language: "English", fileType: "PDF", fileSizeLabel: "540 KB", product: "", subCategory: "", productCertificateType: "", qmsCertificateType: "ISO 9001", industry: "" },
  { tab: "instruction-manual", title: "Solenoid Valve Installation & Maintenance Manual", language: "English", fileType: "PDF", fileSizeLabel: "3.4 MB", product: "Solenoid Valve", subCategory: "3/2 Way", productCertificateType: "", qmsCertificateType: "", industry: "Power" },
  { tab: "instruction-manual", title: "Angle Seat Valve Operating Instructions", language: "English", fileType: "PDF", fileSizeLabel: "2.1 MB", product: "Angle Seat Valve", subCategory: "Pilot Operated", productCertificateType: "", qmsCertificateType: "", industry: "Automotive" },
  { tab: "product-brochure", title: "Solenoid Valve Product Brochure 2026", language: "English", fileType: "PDF", fileSizeLabel: "5.8 MB", product: "Solenoid Valve", subCategory: "", productCertificateType: "", qmsCertificateType: "", industry: "Rail" },
  { tab: "product-brochure", title: "Positioners Product Brochure", language: "English", fileType: "PDF", fileSizeLabel: "4.2 MB", product: "Positioners", subCategory: "", productCertificateType: "", qmsCertificateType: "", industry: "Aerospace & Defense" },
  { tab: "corporate-catalogue", title: "Rotex Corporate Catalogue 2026", language: "English", fileType: "PDF", fileSizeLabel: "12.5 MB", product: "", subCategory: "", productCertificateType: "", qmsCertificateType: "", industry: "" },
  { tab: "performance-certificates", title: "Cycle Test Performance Certificate", language: "English", fileType: "PDF", fileSizeLabel: "760 KB", product: "Automotive Solutions", subCategory: "5/2 Way", productCertificateType: "", qmsCertificateType: "IATF 16949", industry: "Automotive" },
];

async function main() {
  const existing = await prisma.downloadItem.count();
  if (existing > 0) {
    console.log(`Skipped downloads seed — ${existing} already exist.`);
    return;
  }

  for (const item of DOWNLOADS) {
    await prisma.downloadItem.create({
      data: { ...item, fileUrl: SAMPLE_PDF, image: IMG, published: true },
    });
  }

  console.log(`Seeded ${DOWNLOADS.length} downloads.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
