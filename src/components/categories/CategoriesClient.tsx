"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  getCategories,
  deleteCategory,
  type ICategoryDto,
} from "@/lib/service-categories";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusIcon, PencilIcon, Trash2Icon } from "lucide-react";

// ─── Category Delete Confirm Dialog ───────────────────────────────────────────

function CategoryDeleteDialog({
  category,
  onClose,
}: {
  category: ICategoryDto;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteCategory(category.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onClose();
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Are you sure you want to delete{" "}
        <span className="font-medium text-foreground">
          {category.internalName}
        </span>
        ? This action cannot be undone.
      </p>

      {deleteMutation.error && (
        <p className="text-sm text-destructive">
          {(deleteMutation.error as Error).message ?? "An error occurred."}
        </p>
      )}

      <DialogFooter showCloseButton>
        <Button
          variant="destructive"
          onClick={() => deleteMutation.mutate()}
          disabled={deleteMutation.isPending}
        >
          {deleteMutation.isPending ? "Deleting…" : "Delete"}
        </Button>
      </DialogFooter>
    </div>
  );
}

// ─── Category Row ──────────────────────────────────────────────────────────────

function CategoryRow({
  category,
  locale,
}: {
  category: ICategoryDto;
  locale: string;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-3 pl-4 pr-2 text-sm font-mono max-w-[12rem] truncate">
        {category.internalName}
      </td>
      <td className="hidden sm:table-cell py-3 px-2 text-sm text-muted-foreground">
        {new Date(category.createdAt).toLocaleDateString()}
      </td>
      <td className="py-3 pl-2 pr-4">
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/${locale}/categories/${category.id}/edit`}
            className="inline-flex items-center justify-center rounded-md w-7 h-7 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Edit"
          >
            <PencilIcon className="size-4" />
            <span className="sr-only">Edit</span>
          </Link>

          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger
              render={
                <Button
                  variant="destructive"
                  size="icon-sm"
                  title="Delete category"
                />
              }
            >
              <Trash2Icon className="size-4" />
              <span className="sr-only">Delete</span>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Category</DialogTitle>
              </DialogHeader>
              <CategoryDeleteDialog
                category={category}
                onClose={() => setDeleteOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Client Component ─────────────────────────────────────────────────────

export default function CategoriesClient() {
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const pathname = usePathname();
  const locale = pathname.split("/")[1];

  const { data, isLoading, isError } = useQuery({
    queryKey: ["categories", page],
    queryFn: () =>
      getCategories({ PageNumber: page, PageSize: pageSize }).then(
        (r) => r.data
      ),
  });

  const categories = data?.values ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Categories</CardTitle>
        <div className="col-start-2 row-span-2 row-start-1 self-start justify-self-end">
          <Button size="sm" render={<Link href={`/${locale}/categories/create`} />}>
            <PlusIcon className="size-4" />
            <span className="hidden sm:inline">Add Category</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading && (
          <p className="px-4 py-6 text-sm text-muted-foreground">Loading…</p>
        )}

        {isError && (
          <p className="px-4 py-6 text-sm text-destructive">
            Failed to load categories.
          </p>
        )}

        {!isLoading && !isError && categories.length === 0 && (
          <p className="px-4 py-6 text-sm text-muted-foreground">
            No categories found.
          </p>
        )}

        {categories.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="py-2.5 pl-4 pr-2 text-left text-xs font-medium text-muted-foreground">
                    Internal Name
                  </th>
                  <th className="hidden sm:table-cell py-2.5 px-2 text-left text-xs font-medium text-muted-foreground">
                    Created
                  </th>
                  <th className="py-2.5 pl-2 pr-4 text-right text-xs font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <CategoryRow key={cat.id} category={cat} locale={locale} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <span className="text-xs text-muted-foreground">
              {totalCount} categor{totalCount !== 1 ? "ies" : "y"}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="xs"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="px-2 text-xs text-muted-foreground">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="xs"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
