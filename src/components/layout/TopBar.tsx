"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

interface TopBarProps {
  onMenuToggle: () => void;
}

export default function TopBar({ onMenuToggle }: TopBarProps) {
  const pathname = usePathname();
  const t = useTranslations("DASHBOARD");
  const segments = pathname.split("/").filter(Boolean);
  // segments[0] = locale, segments[1] = resource, segments[2] = 'create' | id, segments[3] = 'edit'
  const resourceKey = segments[1];
  const sub = segments[2];
  const action = segments[3];

  const titles: Record<string, { list: string; create: string; edit: string }> = {
    blogs: { list: t("BLOGS"), create: t("CREATE_BLOG"), edit: t("EDIT_BLOG") },
    videos: { list: t("VIDEOS"), create: t("CREATE_VIDEO"), edit: t("EDIT_VIDEO") },
    categories: { list: t("CATEGORIES"), create: t("CREATE_CATEGORY"), edit: t("EDIT_CATEGORY") },
    languages: { list: t("LANGUAGES"), create: t("CREATE_LANGUAGE"), edit: t("EDIT_LANGUAGE") },
  };

  let pageTitle = t("DASHBOARD");
  if (resourceKey && titles[resourceKey]) {
    if (sub === "create") {
      pageTitle = titles[resourceKey].create;
    } else if (action === "edit") {
      pageTitle = titles[resourceKey].edit;
    } else {
      pageTitle = titles[resourceKey].list;
    }
  }

  return (
    <header className="sticky top-0 z-30 flex items-center h-16 px-4 gap-3 bg-card border-b border-border shadow-sm shrink-0">
      {/* Hamburger */}
      <button
        onClick={onMenuToggle}
        aria-label="Toggle navigation"
        className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-foreground truncate">{pageTitle}</h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
          style={{ background: "#666CFF" }}
        >
          A
        </div>
        <span className="hidden sm:block text-sm font-medium text-foreground">
          {t("ADMIN")}
        </span>
      </div>
    </header>
  );
}
