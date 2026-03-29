import type { Metadata } from "next";
import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import QueryProvider from "@/providers/QueryProvider";
import AuthProvider from "@/providers/AuthProvider";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import DashboardShell from "@/components/layout/DashboardShell";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/* ─── Metadata ────────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: "Services Psychologist",
  description: "Psychologist services client application",
};

/* ─── Layout ──────────────────────────────────────────────────────────────── */

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "ru" | "am")) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <QueryProvider>
      <NextIntlClientProvider messages={messages}>
        <AuthProvider>
          <DashboardShell locale={locale}>
            {children}
          </DashboardShell>
        </AuthProvider>
      </NextIntlClientProvider>
    </QueryProvider>
  );
}

