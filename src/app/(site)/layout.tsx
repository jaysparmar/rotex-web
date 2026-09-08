import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "../globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageLoader } from "@/components/ui/page-loader";
import { HashScroll } from "@/components/ui/hash-scroll";
import { getResolvedGlobalConfig } from "@/lib/global-config";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Rotex | Industrial Solutions",
  description: "Leading provider of industrial rotary solutions and equipment",
};

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const config = await getResolvedGlobalConfig();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${montserrat.variable} font-montserrat`} suppressHydrationWarning>
        <PageLoader />
        <HashScroll />
        <Navbar config={config} />
        <main>{children}</main>
        <Footer config={config} />
      </body>
    </html>
  );
}
