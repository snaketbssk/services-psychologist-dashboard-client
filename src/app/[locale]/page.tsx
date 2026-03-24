import { setRequestLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { FileText, Video, Tag, Globe2 } from "lucide-react";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("DASHBOARD");

  const sections = [
    {
      label: t("BLOGS"),
      description: t("BLOGS_DESC"),
      href: "/blogs",
      icon: FileText,
      color: "#666CFF",
      bg: "rgba(102, 108, 255, 0.12)",
    },
    {
      label: t("VIDEOS"),
      description: t("VIDEOS_DESC"),
      href: "/videos",
      icon: Video,
      color: "#26C6F9",
      bg: "rgba(38, 198, 249, 0.12)",
    },
    {
      label: t("CATEGORIES"),
      description: t("CATEGORIES_DESC"),
      href: "/categories",
      icon: Tag,
      color: "#72E128",
      bg: "rgba(114, 225, 40, 0.12)",
    },
    {
      label: t("LANGUAGES"),
      description: t("LANGUAGES_DESC"),
      href: "/languages",
      icon: Globe2,
      color: "#FDB528",
      bg: "rgba(253, 181, 40, 0.12)",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
            style={{ background: "#666CFF" }}
          >
            P
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {t("WELCOME")}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {t("WELCOME_DESC")}
            </p>
          </div>
        </div>
      </div>

      {/* Quick access cards */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {t("QUICK_ACCESS")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sections.map((section) => (
            <Link key={section.href} href={`/${locale}${section.href}`}>
              <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer group h-full">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: section.bg }}
                >
                  <section.icon size={22} style={{ color: section.color }} />
                </div>
                <p className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                  {section.label}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {section.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
