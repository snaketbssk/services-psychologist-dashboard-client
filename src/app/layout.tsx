import type { ReactNode } from "react";
import { Inter, Roboto_Slab, Playfair_Display } from "next/font/google";
import { getLocale } from "next-intl/server";
import "./globals.css";

/* ─── Fonts ───────────────────────────────────────────────────────────────── */

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const robotoSlab = Roboto_Slab({
  variable: "--font-roboto-slab",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  style: ["normal", "italic"],
});

/* ─── Layout ──────────────────────────────────────────────────────────────── */

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${robotoSlab.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
