import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { execSync } from "node:child_process";
import path from "node:path";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!.replace(/^file:/, ""),
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@rotex.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "changeme123";
  const hash = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: { email, password: hash, name: "Admin" },
  });

  console.log(`Admin user ready: ${email}`);

  await prisma.$disconnect();

  // Real client content (industries, home page, partners, etc.) — kept as a
  // separate script/db connection so it can also be run standalone.
  execSync("npx tsx prisma/seed-content.ts", {
    stdio: "inherit",
    cwd: path.join(__dirname, ".."),
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
