"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusIcon, PencilIcon, Trash2Icon, LanguagesIcon } from "lucide-react";

// ─── Category Form Dialog ──────────────────────────────────────────────────────

function CategoryFormDialog({
  category,
  onClose,
}: {
  category?: ICategoryDto;
  onClose: () => void;
}) {
  const [internalName, setInternalName] = useState(
    category?.internalName ?? ""
  );
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: () => createCategory({ internalName: internalName || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateCategory(category!.id, { internalName: internalName || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onClose();
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (category) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  return (
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
          className="h-8 rounded-lg border border-border bg-background px-3 text-sm outline-none ring-0 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">
          {(error as Error).message ?? "An error occurred."}
        </p>
      )}

      <DialogFooter showCloseButton>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : category ? "Save Changes" : "Create"}
        </Button>
      </DialogFooter>
    </form>
  );
}

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
  const [name, setName] = useState(translation?.name ?? "");
  const [languageId, setLanguageId] = useState(
    translation?.languageId ?? languages[0]?.id ?? ""
  );
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
            className="h-8 rounded-lg border border-border bg-background px-3 text-sm outline-none ring-0 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
          className="h-8 rounded-lg border border-border bg-background px-3 text-sm outline-none ring-0 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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

// ─── Translation Delete Confirm Dialog ────────────────────────────────────────

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
        translation <span className="font-medium text-foreground">"{translation.name}"</span>?
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

// ─── Translations Dialog Content ──────────────────────────────────────────────

function CategoryTranslationsDialog({ category }: { category: ICategoryDto }) {
  const [addOpen, setAddOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data: translationsData, isLoading, isError } = useQuery({
    queryKey: ["category-translations", category.id, page],
    queryFn: () =>
      getCategoryTranslations({
        categoryId: category.id,
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Translations for{" "}
          <span className="font-medium text-foreground">
            {category.internalName}
          </span>
        </p>
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
              categoryId={category.id}
              languages={languages}
              onClose={() => setAddOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading…</p>
      )}

      {isError && (
        <p className="text-sm text-destructive">Failed to load translations.</p>
      )}

      {!isLoading && !isError && translations.length === 0 && (
        <p className="text-sm text-muted-foreground">No translations yet.</p>
      )}

      {translations.length > 0 && (
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
                categoryId={category.id}
                translation={t}
                languages={languages}
              />
            ))}
          </tbody>
        </table>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-xs text-muted-foreground">
            {totalCount} translation{totalCount !== 1 ? "s" : ""}
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
    </div>
  );
}

// ─── Category Row ──────────────────────────────────────────────────────────────

function CategoryRow({ category }: { category: ICategoryDto }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [translationsOpen, setTranslationsOpen] = useState(false);

  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-3 pl-4 pr-2 text-sm font-mono">
        {category.internalName}
      </td>
      <td className="py-3 px-2 text-sm text-muted-foreground">
        {new Date(category.createdAt).toLocaleDateString()}
      </td>
      <td className="py-3 pl-2 pr-4">
        <div className="flex items-center justify-end gap-1">
          <Dialog open={translationsOpen} onOpenChange={setTranslationsOpen}>
            <DialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  title="Manage translations"
                />
              }
            >
              <LanguagesIcon className="size-4" />
              <span className="sr-only">Translations</span>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Translations</DialogTitle>
              </DialogHeader>
              <CategoryTranslationsDialog category={category} />
            </DialogContent>
          </Dialog>

          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger
              render={
                <Button variant="ghost" size="icon-sm" title="Edit category" />
              }
            >
              <PencilIcon className="size-4" />
              <span className="sr-only">Edit</span>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
              </DialogHeader>
              <CategoryFormDialog
                category={category}
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
  const [createOpen, setCreateOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;

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
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger render={<Button size="sm" />}>
              <PlusIcon className="size-4" />
              Add Category
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Category</DialogTitle>
              </DialogHeader>
              <CategoryFormDialog onClose={() => setCreateOpen(false)} />
            </DialogContent>
          </Dialog>
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
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="py-2.5 pl-4 pr-2 text-left text-xs font-medium text-muted-foreground">
                  Internal Name
                </th>
                <th className="py-2.5 px-2 text-left text-xs font-medium text-muted-foreground">
                  Created
                </th>
                <th className="py-2.5 pl-2 pr-4 text-right text-xs font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <CategoryRow key={cat.id} category={cat} />
              ))}
            </tbody>
          </table>
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
