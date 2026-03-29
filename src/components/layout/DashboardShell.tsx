"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

interface DashboardShellProps {
  locale: string;
  children: ReactNode;
}

export default function DashboardShell({ locale, children }: DashboardShellProps) {
  const { isLoading, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const segments = pathname.split("/").filter(Boolean); // [locale, ...rest]

  // Public pages render without the dashboard shell (no auth required)
  const isPublicPage = segments[1] === "login" || segments[1] === "auth";

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublicPage) {
      const loc = segments[0] || "en";
      router.push(`/${loc}/login`);
    }
  }, [isLoading, isAuthenticated, isPublicPage, segments, router]);

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMenuToggle = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setMobileOpen((v) => !v);
    } else {
      setCollapsed((v) => !v);
    }
  };

  // Login page and OAuth callback pages render without shell chrome
  if (isPublicPage) return <>{children}</>;

  // Auth still resolving — show centered spinner
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated — redirect already triggered via useEffect; return null while navigating
  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        locale={locale}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main content area shifts right to make room for the sidebar */}
      <div
        className={cn(
          "flex flex-col flex-1 min-w-0 transition-[margin] duration-300 ease-in-out",
          "ml-0 md:ml-[260px]",
          collapsed && "md:ml-[68px]"
        )}
      >
        <TopBar onMenuToggle={handleMenuToggle} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
