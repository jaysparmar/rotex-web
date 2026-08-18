import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";

// Applies the persisted theme class before hydration, avoiding a flash of the
// wrong theme. Runs in place of next-themes' own injected <script> — that one
// trips React 19's dev-only "script tag encountered while rendering" warning
// since it renders deep in a client component tree. A plain <script> emitted
// directly by this Server Component gets React's Document Metadata hoisting
// instead, which skips that warning path.
// (patches/next-themes+0.4.6.patch disables the library's built-in script.)
const NO_FLASH_SCRIPT = `
(function () {
  try {
    var storageKey = "rotex-admin-theme";
    var stored = localStorage.getItem(storageKey) || "dark";
    var theme = stored === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : stored;
    var root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    root.style.colorScheme = theme;
  } catch (e) {}
})();
`;

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Rotex Admin",
  description: "Rotex admin panel",
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script id="theme-no-flash" dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }} />
      </head>
      <body className={`${montserrat.variable} min-h-screen bg-background font-montserrat text-foreground`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem storageKey="rotex-admin-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
