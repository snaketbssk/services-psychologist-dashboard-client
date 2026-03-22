import { setRequestLocale } from "next-intl/server";
import BlogsClient from "@/components/blogs/BlogsClient";

export default async function BlogsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <BlogsClient />;
}
