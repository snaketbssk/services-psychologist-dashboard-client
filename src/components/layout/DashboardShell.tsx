"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

interface DashboardShellProps {
  locale: string;
  children: ReactNode;
}

export default function DashboardShell({ locale, children }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMenuToggle = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setMobileOpen((v) => !v);
    } else {
      setCollapsed((v) => !v);
    }
  };

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
