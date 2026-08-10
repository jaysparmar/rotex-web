import { getSupplierSection } from "@/lib/supplier-section";

export async function GET() {
  return getSupplierSection("hero");
}
