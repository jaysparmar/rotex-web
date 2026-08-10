import { getContactSection } from "@/lib/contact-section";

export async function GET() {
  return getContactSection("hero");
}
