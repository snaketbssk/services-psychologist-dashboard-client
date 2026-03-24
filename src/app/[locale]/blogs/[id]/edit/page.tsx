import { setRequestLocale } from "next-intl/server";
import BlogEditClient from "@/components/blogs/BlogEditClient";

export default async function BlogEditPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return <BlogEditClient id={id} />;
}
