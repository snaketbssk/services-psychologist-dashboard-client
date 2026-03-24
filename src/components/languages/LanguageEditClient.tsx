"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLanguages,
  updateLanguage,
  type ILanguageDto,
} from "@/lib/service-languages";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Link from "next/link";

const inputClass =
  "h-8 rounded-lg border border-border bg-background px-3 text-sm outline-none ring-0 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

// ─── Language Edit Form ────────────────────────────────────────────────────────

function LanguageEditForm({
  id,
  language,
  locale,
}: {
  id: string;
  language: ILanguageDto;
  locale: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [code, setCode] = useState(language.code ?? "");

  const updateMutation = useMutation({
    mutationFn: () => updateLanguage(id, { code: code || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["languages"] });
      queryClient.invalidateQueries({ queryKey: ["language", id] });
      router.push(`/${locale}/languages`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-6">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="code" className="text-sm font-medium">
          Language Code
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

      {updateMutation.error && (
        <p className="text-sm text-destructive">
          {(updateMutation.error as Error).message ?? "An error occurred."}
        </p>
      )}

      <div className="flex items-center gap-2 pt-2">
        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? "Saving…" : "Save Changes"}
        </Button>
        <Button variant="outline" render={<Link href={`/${locale}/languages`} />}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ─── Main Edit Client ──────────────────────────────────────────────────────────

export default function LanguageEditClient({ id }: { id: string }) {
  const pathname = usePathname();
  const locale = pathname.split("/")[1];

  const { data: languageData, isLoading, isError } = useQuery({
    queryKey: ["languages"],
    queryFn: () => getLanguages({ PageSize: 100 }).then((r) => r.data),
    select: (data) => data.values?.find((l) => l.id === id),
  });

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground px-4 py-6">Loading…</p>
    );
  }

  if (isError || !languageData) {
    return (
      <p className="text-sm text-destructive px-4 py-6">
        Failed to load language.
      </p>
    );
  }

  return (
    <Card className="max-w-xl">
      <CardHeader className="border-b">
        <CardTitle>Edit Language</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          <TabsContent value="details">
            <LanguageEditForm id={id} language={languageData} locale={locale} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
