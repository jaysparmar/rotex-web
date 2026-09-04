import { chromium } from "playwright";
import path from "path";

const base = "http://localhost:3000";
const shotDir = "/private/tmp/claude-501/-Users-jay-Desktop-projects-rotex-web/9da1c051-a4db-4b3d-a411-b37a1f140b54/scratchpad";

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
const errors = [];
page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
page.on("pageerror", (err) => errors.push(String(err)));

page.on("response", async (res) => {
  if (res.url().includes("/api/admin/products/import/")) {
    let bodyText = "";
    try { bodyText = await res.text(); } catch (e) { bodyText = "‹could not read body: " + e + "›"; }
    console.log("=== RESPONSE", res.status(), res.url());
    console.log(bodyText.slice(0, 6000));
    console.log("=== END RESPONSE ===");
  }
});

await page.goto(`${base}/admin/login`, { waitUntil: "networkidle" });
await page.fill('input[type="email"]', "admin@rotex.com");
await page.fill('input[type="password"]', "changeme123");
await page.click('button[type="submit"]');
await page.waitForURL(/\/admin(\/)?$/, { timeout: 15000 });

await page.goto(`${base}/admin/products/import`, { waitUntil: "networkidle" });
await page.locator('input[type="file"]').setInputFiles(path.join(shotDir, "test-import.xlsx"));
await page.waitForTimeout(1200);
await page.click('button:has-text("Next: Map columns")');
await page.waitForTimeout(400);
await page.click('button:has-text("Choose category...")');
await page.waitForTimeout(300);
await page.locator('[role="option"]').nth(0).click();
await page.waitForTimeout(300);
await page.click('button:has-text("Next: Map columns")');
await page.waitForTimeout(500);
const rows = page.locator("table tbody tr");
await rows.nth(0).locator('button').first().click();
await page.waitForTimeout(200);
await page.getByRole("option", { name: "Model Number", exact: true }).click();
await page.waitForTimeout(200);
await page.click('button:has-text("Next: Specifications")');
await page.waitForTimeout(500);
await page.click('button:has-text("Next: Preview")');
await page.waitForTimeout(1500);

await page.click('button:has-text("Confirm & Import")');
await page.waitForTimeout(2000);
await page.screenshot({ path: path.join(shotDir, "commit-result.png") });

console.log("Console errors so far:", errors);
await browser.close();
