import { setRequestLocale } from "next-intl/server";
import LanguagesClient from "@/components/languages/LanguagesClient";

export default async function LanguagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <LanguagesClient />
    </main>
  );
}
