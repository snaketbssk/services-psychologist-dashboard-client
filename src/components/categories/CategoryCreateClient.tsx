"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCategory } from "@/lib/service-categories";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Link from "next/link";

const inputClass =
  "h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none ring-0 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export default function CategoryCreateClient() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];

  const [internalName, setInternalName] = useState("");

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: () => createCategory({ internalName: internalName || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      router.push(`/${locale}/categories`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  return (
    <Card className="max-w-xl">
      <CardHeader className="border-b">
        <CardTitle>Create Category</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="px-4 py-5 sm:px-6 sm:py-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="internalName" className="text-sm font-medium">
                  Internal Name
                </label>
                <input
                  id="internalName"
                  type="text"
                  value={internalName}
                  onChange={(e) => setInternalName(e.target.value)}
                  placeholder="e.g. anxiety, relationships"
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
                  {createMutation.isPending ? "Creating…" : "Create Category"}
                </Button>
                <Button variant="outline" render={<Link href={`/${locale}/categories`} />}>
                  Cancel
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
