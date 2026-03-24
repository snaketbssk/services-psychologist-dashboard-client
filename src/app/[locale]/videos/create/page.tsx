import { setRequestLocale } from "next-intl/server";
import VideoCreateClient from "@/components/videos/VideoCreateClient";

export default async function VideoCreatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <VideoCreateClient />;
}
