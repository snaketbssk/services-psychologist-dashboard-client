"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLanguage } from "@/lib/service-languages";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Link from "next/link";

const inputClass =
  "h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none ring-0 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export default function LanguageCreateClient() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const t = useTranslations("DASHBOARD");

  const [code, setCode] = useState("");

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: () => createLanguage({ code: code || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["languages"] });
      router.push(`/${locale}/languages`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  return (
    <Card className="max-w-xl">
      <CardHeader className="border-b">
        <CardTitle>{t("CREATE_LANGUAGE")}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">{t("DETAILS")}</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="px-4 py-5 sm:px-6 sm:py-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="code" className="text-sm font-medium">
                  {t("LANGUAGE_CODE")}
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. en, ru, am"
                  className={inputClass}
                />
              </div>

              {createMutation.error && (
                <p className="text-sm text-destructive">
                  {(createMutation.error as Error).message ?? "An error occurred."}
                </p>
              )}

              <div className="flex items-center gap-2 pt-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? t("CREATING") : t("CREATE_LANGUAGE")}
                </Button>
                <Button variant="outline" render={<Link href={`/${locale}/languages`} />}>
                  {t("CANCEL")}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
