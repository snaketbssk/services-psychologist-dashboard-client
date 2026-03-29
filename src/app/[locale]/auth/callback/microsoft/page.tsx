import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import OAuthCallbackClient from "@/components/auth/OAuthCallbackClient";

export default async function MicrosoftCallbackPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense>
      <OAuthCallbackClient provider="microsoft" />
    </Suspense>
  );
}
