import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!.replace(/^file:/, ""),
});
const prisma = new PrismaClient({ adapter });

const PRIVACY_CONTENT = `
<h2>1. Information We Collect</h2>
<p>This is placeholder content. Rotex collects information you provide directly to us, such as your name, email address, and company details when you contact us or request a quote.</p>
<h2>2. How We Use Your Information</h2>
<p>This is placeholder content. We use the information we collect to respond to inquiries, provide our products and services, and improve our website.</p>
<h2>3. Data Sharing</h2>
<p>This is placeholder content. We do not sell your personal information. We may share it with trusted partners who help us operate our business, under confidentiality agreements.</p>
<h2>4. Your Rights</h2>
<p>This is placeholder content. You may request access to, correction of, or deletion of your personal data at any time by contacting us.</p>
<h2>5. Contact Us</h2>
<p>This is placeholder content. Replace this page with your organization's actual privacy policy before going live.</p>
`.trim();

const TERMS_CONTENT = `
<h2>1. Acceptance of Terms</h2>
<p>This is placeholder content. By accessing and using this website, you accept and agree to be bound by these Terms &amp; Conditions.</p>
<h2>2. Use of Service</h2>
<p>This is placeholder content. This website and its content are provided for informational purposes about Rotex's products and services.</p>
<h2>3. Intellectual Property</h2>
<p>This is placeholder content. All content on this site, including text, graphics, and logos, is the property of Rotex unless otherwise noted.</p>
<h2>4. Limitation of Liability</h2>
<p>This is placeholder content. Rotex is not liable for any damages arising from the use of this website or reliance on its content.</p>
<h2>5. Changes to Terms</h2>
<p>This is placeholder content. Replace this page with your organization's actual terms and conditions before going live.</p>
`.trim();

async function main() {
  await prisma.legalPage.upsert({
    where: { key: "privacy" },
    update: {},
    create: { key: "privacy", title: "Privacy Policy", content: PRIVACY_CONTENT },
  });
  await prisma.legalPage.upsert({
    where: { key: "terms" },
    update: {},
    create: { key: "terms", title: "Terms & Conditions", content: TERMS_CONTENT },
  });
  console.log("Seeded LegalPage rows: privacy, terms");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
