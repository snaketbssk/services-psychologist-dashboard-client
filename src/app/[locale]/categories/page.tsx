import { setRequestLocale } from "next-intl/server";
import CategoriesClient from "@/components/categories/CategoriesClient";

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <CategoriesClient />
    </main>
  );
}
