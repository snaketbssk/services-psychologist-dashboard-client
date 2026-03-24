import { setRequestLocale } from "next-intl/server";
import VideoEditClient from "@/components/videos/VideoEditClient";

export default async function VideoEditPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return <VideoEditClient id={id} />;
}
