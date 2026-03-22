import { setRequestLocale } from "next-intl/server";
import LanguagesClient from "@/components/languages/LanguagesClient";

export default async function LanguagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LanguagesClient />;
}
