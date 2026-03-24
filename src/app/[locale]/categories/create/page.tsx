import { setRequestLocale } from "next-intl/server";
import CategoryCreateClient from "@/components/categories/CategoryCreateClient";

export default async function CategoryCreatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CategoryCreateClient />;
}
