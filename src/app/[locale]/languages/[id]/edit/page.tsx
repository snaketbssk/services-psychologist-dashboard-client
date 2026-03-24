import { setRequestLocale } from "next-intl/server";
import LanguageEditClient from "@/components/languages/LanguageEditClient";

export default async function LanguageEditPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return <LanguageEditClient id={id} />;
}
