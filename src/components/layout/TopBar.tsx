"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

interface TopBarProps {
  onMenuToggle: () => void;
}

const PAGE_TITLES: Record<string, string> = {
  blogs: "Blogs",
  videos: "Videos",
  categories: "Categories",
  languages: "Languages",
};

export default function TopBar({ onMenuToggle }: TopBarProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  // segments[0] = locale, segments[1] = page slug
  const pageKey = segments[1];
  const pageTitle = pageKey ? (PAGE_TITLES[pageKey] ?? pageKey) : "Dashboard";

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
          Admin
        </span>
      </div>
    </header>
  );
}
