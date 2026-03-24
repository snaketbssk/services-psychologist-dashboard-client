"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBlog } from "@/lib/service-blogs";
import { getCategories } from "@/lib/service-categories";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Link from "next/link";

const inputClass =
  "h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none ring-0 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export default function BlogCreateClient() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];

  const [internalName, setInternalName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [categoryId, setCategoryId] = useState("");

  const queryClient = useQueryClient();

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories({ PageSize: 100 }).then((r) => r.data),
  });

  const categories = categoriesData?.values ?? [];

  const createMutation = useMutation({
    mutationFn: () =>
      createBlog({
        internalName: internalName || null,
        date: date ? new Date(date).toISOString() : null,
        categoryId: categoryId || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      router.push(`/${locale}/blogs`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  return (
    <Card className="max-w-xl">
      <CardHeader className="border-b">
        <CardTitle>Create Blog</CardTitle>
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
                  placeholder="e.g. anxiety-tips-2024"
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="date" className="text-sm font-medium">
                  Date
                </label>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="categoryId" className="text-sm font-medium">
                  Category
                </label>
                <select
                  id="categoryId"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">— Select category —</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.internalName}
                    </option>
                  ))}
                </select>
              </div>

              {createMutation.error && (
                <p className="text-sm text-destructive">
                  {(createMutation.error as Error).message ?? "An error occurred."}
                </p>
              )}

              <div className="flex items-center gap-2 pt-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating…" : "Create Blog"}
                </Button>
                <Button variant="outline" render={<Link href={`/${locale}/blogs`} />}>
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
