import { setRequestLocale } from "next-intl/server";
import BlogsClient from "@/components/blogs/BlogsClient";

export default async function BlogsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <BlogsClient />
    </main>
  );
}
