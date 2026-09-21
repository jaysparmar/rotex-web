import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Script from "next/script";
import "../globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { AskAiButton } from "@/components/layout/ask-ai-button";
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

const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const config = await getResolvedGlobalConfig();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${montserrat.variable} font-montserrat`} suppressHydrationWarning>
        {/* Only loaded once a real site key is configured — forms fall back to
            honeypot + timing + rate-limit checks alone until then. */}
        {recaptchaSiteKey && (
          <Script
            src={`https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`}
            strategy="afterInteractive"
          />
        )}
        <PageLoader />
        <HashScroll />
        <Navbar config={config} />
        <main>{children}</main>
        <Footer config={config} />
        <WhatsAppButton config={config.whatsapp} />
        <AskAiButton config={config.askAi} />
      </body>
    </html>
  );
}
