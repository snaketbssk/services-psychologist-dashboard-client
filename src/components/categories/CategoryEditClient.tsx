"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCategoryById,
  updateCategory,
  getCategoryTranslations,
  createCategoryTranslation,
  updateCategoryTranslation,
  deleteCategoryTranslation,
  type ICategoryDto,
  type ICategoryTranslationDto,
} from "@/lib/service-categories";
import { getLanguages, type ILanguageDto } from "@/lib/service-languages";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusIcon, PencilIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";

const inputClass =
  "h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none ring-0 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

// ─── Translation Form Dialog ───────────────────────────────────────────────────

function TranslationFormDialog({
  categoryId,
  translation,
  languages,
  onClose,
}: {
  categoryId: string;
  translation?: ICategoryTranslationDto;
  languages: ILanguageDto[];
  onClose: () => void;
}) {
  const [languageId, setLanguageId] = useState(
    translation?.languageId ?? languages[0]?.id ?? ""
  );
  const [name, setName] = useState(translation?.name ?? "");
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: () =>
      createCategoryTranslation({
        categoryId,
        languageId: languageId || null,
        name: name || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["category-translations", categoryId],
      });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateCategoryTranslation(translation!.id, { name: name || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["category-translations", categoryId],
      });
      onClose();
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (translation) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {!translation && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="languageId" className="text-sm font-medium">
            Language
          </label>
          <select
            id="languageId"
            value={languageId}
            onChange={(e) => setLanguageId(e.target.value)}
            className={inputClass}
          >
            {languages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.code}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Anxiety"
          className={inputClass}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">
          {(error as Error).message ?? "An error occurred."}
        </p>
      )}

      <DialogFooter showCloseButton>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : translation ? "Save Changes" : "Add"}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ─── Translation Delete Dialog ─────────────────────────────────────────────────

function TranslationDeleteDialog({
  categoryId,
  translation,
  languageCode,
  onClose,
}: {
  categoryId: string;
  translation: ICategoryTranslationDto;
  languageCode: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteCategoryTranslation(translation.id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["category-translations", categoryId],
      });
      onClose();
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Are you sure you want to delete the{" "}
        <span className="font-medium text-foreground">{languageCode}</span>{" "}
        translation{" "}
        <span className="font-medium text-foreground">
          &ldquo;{translation.name}&rdquo;
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

// ─── Translation Row ───────────────────────────────────────────────────────────

function TranslationRow({
  categoryId,
  translation,
  languages,
}: {
  categoryId: string;
  translation: ICategoryTranslationDto;
  languages: ILanguageDto[];
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const language = languages.find((l) => l.id === translation.languageId);

  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-2.5 pl-4 pr-2 text-sm font-mono text-muted-foreground">
        {language?.code ?? "—"}
      </td>
      <td className="py-2.5 px-2 text-sm">{translation.name}</td>
      <td className="py-2.5 pl-2 pr-4">
        <div className="flex items-center justify-end gap-1">
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger
              render={
                <Button variant="ghost" size="icon-sm" title="Edit translation" />
              }
            >
              <PencilIcon className="size-4" />
              <span className="sr-only">Edit</span>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Translation</DialogTitle>
              </DialogHeader>
              <TranslationFormDialog
                categoryId={categoryId}
                translation={translation}
                languages={languages}
                onClose={() => setEditOpen(false)}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger
              render={
                <Button
                  variant="destructive"
                  size="icon-sm"
                  title="Delete translation"
                />
              }
            >
              <Trash2Icon className="size-4" />
              <span className="sr-only">Delete</span>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Translation</DialogTitle>
              </DialogHeader>
              <TranslationDeleteDialog
                categoryId={categoryId}
                translation={translation}
                languageCode={language?.code ?? translation.languageId}
                onClose={() => setDeleteOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </td>
    </tr>
  );
}

// ─── Translations Tab Content ──────────────────────────────────────────────────

function CategoryTranslationsTab({ categoryId }: { categoryId: string }) {
  const [addOpen, setAddOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data: translationsData, isLoading, isError } = useQuery({
    queryKey: ["category-translations", categoryId, page],
    queryFn: () =>
      getCategoryTranslations({
        categoryId,
        PageNumber: page,
        PageSize: pageSize,
      }).then((r) => r.data),
  });

  const { data: languagesData } = useQuery({
    queryKey: ["languages"],
    queryFn: () => getLanguages({ PageSize: 100 }).then((r) => r.data),
  });

  const translations = translationsData?.values ?? [];
  const totalCount = translationsData?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const languages = languagesData?.values ?? [];

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-sm text-muted-foreground">
          {totalCount} translation{totalCount !== 1 ? "s" : ""}
        </span>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger render={<Button size="sm" />}>
            <PlusIcon className="size-4" />
            Add
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Translation</DialogTitle>
            </DialogHeader>
            <TranslationFormDialog
              categoryId={categoryId}
              languages={languages}
              onClose={() => setAddOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && (
        <p className="px-4 py-6 text-sm text-muted-foreground">Loading…</p>
      )}
      {isError && (
        <p className="px-4 py-6 text-sm text-destructive">
          Failed to load translations.
        </p>
      )}
      {!isLoading && !isError && translations.length === 0 && (
        <p className="px-4 py-6 text-sm text-muted-foreground">
          No translations yet.
        </p>
      )}
      {translations.length > 0 && (
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="py-2 pl-4 pr-2 text-left text-xs font-medium text-muted-foreground">
                Lang
              </th>
              <th className="py-2 px-2 text-left text-xs font-medium text-muted-foreground">
                Name
              </th>
              <th className="py-2 pl-2 pr-4 text-right text-xs font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {translations.map((t) => (
              <TranslationRow
                key={t.id}
                categoryId={categoryId}
                translation={t}
                languages={languages}
              />
            ))}
          </tbody>
        </table>
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex items-center justify-end border-t border-border px-4 py-3">
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
    </div>
  );
}

// ─── Category Edit Form ────────────────────────────────────────────────────────

function CategoryEditForm({
  id,
  category,
  locale,
}: {
  id: string;
  category: ICategoryDto;
  locale: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [internalName, setInternalName] = useState(category.internalName ?? "");

  const updateMutation = useMutation({
    mutationFn: () =>
      updateCategory(id, { internalName: internalName || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["category", id] });
      router.push(`/${locale}/categories`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 py-5 sm:px-6 sm:py-6">
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

      {updateMutation.error && (
        <p className="text-sm text-destructive">
          {(updateMutation.error as Error).message ?? "An error occurred."}
        </p>
      )}

      <div className="flex items-center gap-2 pt-2">
        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? "Saving…" : "Save Changes"}
        </Button>
        <Button variant="outline" render={<Link href={`/${locale}/categories`} />}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ─── Main Edit Client ──────────────────────────────────────────────────────────

export default function CategoryEditClient({ id }: { id: string }) {
  const pathname = usePathname();
  const locale = pathname.split("/")[1];

  const { data: categoryData, isLoading, isError } = useQuery({
    queryKey: ["category", id],
    queryFn: () => getCategoryById(id).then((r) => r.data),
  });

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground px-4 py-6">Loading…</p>
    );
  }

  if (isError || !categoryData) {
    return (
      <p className="text-sm text-destructive px-4 py-6">
        Failed to load category.
      </p>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Edit Category</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="translations">Translations</TabsTrigger>
          </TabsList>
          <TabsContent value="details">
            <CategoryEditForm id={id} category={categoryData} locale={locale} />
          </TabsContent>
          <TabsContent value="translations">
            <CategoryTranslationsTab categoryId={id} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
