"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { exchangeCodeForToken } from "@/lib/service-identity";
import type { AuthenticationSessionDto } from "@/lib/service-identity";

type Status = "loading" | "error";

interface OAuthCallbackClientProps {
  provider: "github" | "google" | "microsoft";
}

export default function OAuthCallbackClient({ provider: _provider }: OAuthCallbackClientProps) {
  const t = useTranslations("AUTH");
  const { loginWithSession } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = pathname.split("/")[1] || "en";

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function handle() {
      // 1. Check for error (Microsoft sends error + error_description)
      const error = searchParams.get("error");
      const errorDesc = searchParams.get("error_description");
      if (error) {
        setMessage(errorDesc ?? error);
        setStatus("error");
        return;
      }

      // 2. Check for tokens delivered directly in query params
      const accessToken  = searchParams.get("access_token");
      const refreshToken = searchParams.get("refresh_token");
      const expiresIn    = searchParams.get("expires_in");
      const tokenType    = searchParams.get("token_type") ?? "Bearer";
      if (accessToken && refreshToken && expiresIn) {
        try {
          const session: AuthenticationSessionDto = {
            tokenType,
            accessToken,
            refreshToken,
            expiresIn: Number(expiresIn),
          };
          await loginWithSession(session);
          router.replace(`/${locale}`);
        } catch {
          setMessage(t("GENERIC_ERROR"));
          setStatus("error");
        }
        return;
      }

      // 3. Check for authorization code to exchange
      const code = searchParams.get("code");
      if (code) {
        try {
          const session = await exchangeCodeForToken(code);
          await loginWithSession(session);
          router.replace(`/${locale}`);
        } catch {
          setMessage(t("GENERIC_ERROR"));
          setStatus("error");
        }
        return;
      }

      // 4. No recognized params
      setMessage(t("OAUTH_UNKNOWN_RESPONSE"));
      setStatus("error");
    }

    handle();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">{t("OAUTH_COMPLETING")}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-4">
      <div className="w-full max-w-sm rounded-xl border border-destructive/30 bg-card p-6 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-destructive" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="mb-4 text-sm text-foreground">{message}</p>
        <Link
          href={`/${locale}/login`}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          {t("BACK_TO_LOGIN")}
        </Link>
      </div>
    </div>
  );
}
