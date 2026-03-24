import { setRequestLocale } from "next-intl/server";
import CategoryEditClient from "@/components/categories/CategoryEditClient";

export default async function CategoryEditPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return <CategoryEditClient id={id} />;
}
