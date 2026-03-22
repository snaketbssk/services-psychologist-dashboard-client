"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Video,
  Tag,
  Globe2,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  locale: string;
  collapsed: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({
  locale,
  collapsed,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();

  const sections: NavSection[] = [
    {
      title: "Dashboards",
      items: [
        { label: "Dashboard", href: `/${locale}`, icon: LayoutDashboard },
      ],
    },
    {
      title: "Content Management",
      items: [
        { label: "Blogs", href: `/${locale}/blogs`, icon: FileText },
        { label: "Videos", href: `/${locale}/videos`, icon: Video },
      ],
    },
    {
      title: "Settings",
      items: [
        { label: "Categories", href: `/${locale}/categories`, icon: Tag },
        { label: "Languages", href: `/${locale}/languages`, icon: Globe2 },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === `/${locale}`) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col overflow-hidden",
          "transition-[width,transform] duration-300 ease-in-out",
          collapsed ? "w-[68px]" : "w-[260px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        style={{ background: "var(--sidebar)", boxShadow: "4px 0 24px rgba(0,0,0,0.15)" }}
      >
        {/* Brand */}
        <div
          className="flex items-center h-16 shrink-0 px-4"
          style={{ borderBottom: "1px solid var(--sidebar-border)" }}
        >
          <Link
            href={`/${locale}`}
            onClick={onMobileClose}
            className="flex items-center gap-3 min-w-0"
          >
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg text-white font-bold text-sm shrink-0"
              style={{ background: "var(--sidebar-primary)" }}
            >
              P
            </div>
            {!collapsed && (
              <span
                className="text-sm font-semibold tracking-wide truncate"
                style={{ color: "var(--sidebar-foreground)" }}
              >
                Psy Dashboard
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3">
          {sections.map((section) => (
            <div key={section.title} className="mb-1">
              {/* Section title */}
              {!collapsed ? (
                <p
                  className="px-5 py-2 text-[10px] font-semibold uppercase tracking-widest select-none"
                  style={{ color: "var(--sidebar-foreground)", opacity: 0.45 }}
                >
                  {section.title}
                </p>
              ) : (
                <div
                  className="mx-4 my-2 h-px"
                  style={{ background: "var(--sidebar-border)" }}
                />
              )}

              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onMobileClose}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-3 mx-2 mb-0.5 rounded-lg px-3 py-2.5",
                      "text-sm font-medium transition-colors duration-150",
                      collapsed && "justify-center"
                    )}
                    style={
                      active
                        ? {
                            background: "var(--sidebar-accent)",
                            color: "var(--sidebar-accent-foreground)",
                          }
                        : {
                            color: "var(--sidebar-foreground)",
                          }
                    }
                    onMouseEnter={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.background =
                          "rgba(255,255,255,0.05)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.background = "";
                      }
                    }}
                  >
                    <item.icon
                      size={20}
                      className="shrink-0"
                      style={
                        active
                          ? { color: "var(--sidebar-accent-foreground)" }
                          : {
                              color: "var(--sidebar-foreground)",
                              opacity: 0.7,
                            }
                      }
                    />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
