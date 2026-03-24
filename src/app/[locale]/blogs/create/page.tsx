import { setRequestLocale } from "next-intl/server";
import BlogCreateClient from "@/components/blogs/BlogCreateClient";

export default async function BlogCreatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <BlogCreateClient />;
}
