import { setRequestLocale } from "next-intl/server";
import VideosClient from "@/components/videos/VideosClient";

export default async function VideosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <VideosClient />
    </main>
  );
}
