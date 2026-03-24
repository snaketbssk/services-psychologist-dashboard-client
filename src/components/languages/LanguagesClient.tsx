"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  getLanguages,
  deleteLanguage,
  setDefaultLanguage,
  type ILanguageDto,
} from "@/lib/service-languages";
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
import { PlusIcon, PencilIcon, Trash2Icon, StarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Delete Confirm Dialog ─────────────────────────────────────────────────────

function DeleteConfirmDialog({
  language,
  onClose,
}: {
  language: ILanguageDto;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteLanguage(language.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["languages"] });
      onClose();
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Are you sure you want to delete the language{" "}
        <span className="font-medium text-foreground">{language.code}</span>?
        This action cannot be undone.
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

// ─── Language Row ──────────────────────────────────────────────────────────────

function LanguageRow({
  language,
  locale,
}: {
  language: ILanguageDto;
  locale: string;
}) {
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const setDefaultMutation = useMutation({
    mutationFn: () => setDefaultLanguage(language.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["languages"] });
    },
  });

  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-3 pl-4 pr-2 text-sm font-mono">{language.code}</td>
      <td className="py-3 px-2">
        {language.isDefault ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            <StarIcon className="size-3" />
            Default
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </td>
      <td className="py-3 pl-2 pr-4">
        <div className="flex items-center justify-end gap-1">
          {!language.isDefault && (
            <Button
              variant="ghost"
              size="icon-sm"
              title="Set as default"
              onClick={() => setDefaultMutation.mutate()}
              disabled={setDefaultMutation.isPending}
            >
              <StarIcon
                className={cn(
                  "size-4",
                  setDefaultMutation.isPending && "animate-spin"
                )}
              />
              <span className="sr-only">Set as default</span>
            </Button>
          )}

          <Link
            href={`/${locale}/languages/${language.id}/edit`}
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
                  title="Delete language"
                />
              }
            >
              <Trash2Icon className="size-4" />
              <span className="sr-only">Delete</span>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Language</DialogTitle>
              </DialogHeader>
              <DeleteConfirmDialog
                language={language}
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

export default function LanguagesClient() {
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const pathname = usePathname();
  const locale = pathname.split("/")[1];

  const { data, isLoading, isError } = useQuery({
    queryKey: ["languages", page],
    queryFn: () =>
      getLanguages({ PageNumber: page, PageSize: pageSize }).then(
        (r) => r.data
      ),
  });

  const languages = data?.values ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Languages</CardTitle>
        <div className="col-start-2 row-span-2 row-start-1 self-start justify-self-end">
          <Button size="sm" render={<Link href={`/${locale}/languages/create`} />}>
            <PlusIcon className="size-4" />
            <span className="hidden sm:inline">Add Language</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading && (
          <p className="px-4 py-6 text-sm text-muted-foreground">Loading…</p>
        )}

        {isError && (
          <p className="px-4 py-6 text-sm text-destructive">
            Failed to load languages.
          </p>
        )}

        {!isLoading && !isError && languages.length === 0 && (
          <p className="px-4 py-6 text-sm text-muted-foreground">
            No languages found.
          </p>
        )}

        {languages.length > 0 && (
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="py-2.5 pl-4 pr-2 text-left text-xs font-medium text-muted-foreground">
                  Code
                </th>
                <th className="py-2.5 px-2 text-left text-xs font-medium text-muted-foreground">
                  Status
                </th>
                <th className="py-2.5 pl-2 pr-4 text-right text-xs font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {languages.map((lang) => (
                <LanguageRow key={lang.id} language={lang} locale={locale} />
              ))}
            </tbody>
          </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <span className="text-xs text-muted-foreground">
              {totalCount} language{totalCount !== 1 ? "s" : ""}
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
