"use client";

import { useTranslations } from "next-intl";

/**
 * Returns all translations as a typed object for dot-notation access.
 *
 * Usage in any Client Component:
 *   const t = useT();
 *   return <h1>{t.welcome}</h1>;
 */
export function useT() {
  const t = useTranslations();

  return {
    welcome: t("welcome"),
    getStarted: t("getStarted"),
    description: t("description"),
    tagline: t("tagline"),
    home: t("home"),
    about: t("about"),
    contact: t("contact"),
    bookSession: t("bookSession"),
    learnMore: t("learnMore"),
    language: t("language"),
  } as const;
}

export type T = ReturnType<typeof useT>;
