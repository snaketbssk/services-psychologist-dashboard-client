"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBlogById,
  updateBlog,
  getBlogTranslations,
  createBlogTranslation,
  updateBlogTranslation,
  deleteBlogTranslation,
  type IBlogDto,
  type IBlogTranslationDto,
} from "@/lib/service-blogs";
import { getCategories } from "@/lib/service-categories";
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
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { PlusIcon, PencilIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";

const inputClass =
  "h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none ring-0 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const textareaClass =
  "rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-0 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

// ─── Translation Form Dialog ───────────────────────────────────────────────────

function BlogTranslationFormDialog({
  blogId,
  translation,
  languages,
  onClose,
}: {
  blogId: string;
  translation?: IBlogTranslationDto;
  languages: ILanguageDto[];
  onClose: () => void;
}) {
  const [languageId, setLanguageId] = useState(
    translation?.languageId ?? languages[0]?.id ?? ""
  );
  const [title, setTitle] = useState(translation?.title ?? "");
  const [excerpt, setExcerpt] = useState(translation?.excerpt ?? "");
  const [content, setContent] = useState(translation?.content ?? "");
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: () =>
      createBlogTranslation({
        blogId,
        languageId: languageId || null,
        title: title || null,
        excerpt: excerpt || null,
        content: content || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-translations", blogId] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateBlogTranslation(translation!.id, {
        title: title || null,
        excerpt: excerpt || null,
        content: content || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-translations", blogId] });
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
        <label htmlFor="trans-title" className="text-sm font-medium">
          Title
        </label>
        <input
          id="trans-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Blog post title"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="trans-excerpt" className="text-sm font-medium">
          Excerpt
        </label>
        <textarea
          id="trans-excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Short summary…"
          rows={2}
          className={textareaClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Content</label>
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="Full blog content…"
          disabled={isPending}
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

function BlogTranslationDeleteDialog({
  blogId,
  translation,
  languageCode,
  onClose,
}: {
  blogId: string;
  translation: IBlogTranslationDto;
  languageCode: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteBlogTranslation(translation.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-translations", blogId] });
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
          &ldquo;{translation.title}&rdquo;
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

function BlogTranslationRow({
  blogId,
  translation,
  languages,
}: {
  blogId: string;
  translation: IBlogTranslationDto;
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
      <td className="py-2.5 px-2 text-sm">{translation.title}</td>
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
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Translation</DialogTitle>
              </DialogHeader>
              <BlogTranslationFormDialog
                blogId={blogId}
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
              <BlogTranslationDeleteDialog
                blogId={blogId}
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

function BlogTranslationsTab({ blogId }: { blogId: string }) {
  const [addOpen, setAddOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data: translationsData, isLoading, isError } = useQuery({
    queryKey: ["blog-translations", blogId, page],
    queryFn: () =>
      getBlogTranslations({
        BlogId: blogId,
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
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Translation</DialogTitle>
            </DialogHeader>
            <BlogTranslationFormDialog
              blogId={blogId}
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
                Title
              </th>
              <th className="py-2 pl-2 pr-4 text-right text-xs font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {translations.map((t) => (
              <BlogTranslationRow
                key={t.id}
                blogId={blogId}
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

// ─── Blog Edit Form ────────────────────────────────────────────────────────────

function BlogEditForm({
  id,
  blog,
  locale,
}: {
  id: string;
  blog: IBlogDto;
  locale: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [internalName, setInternalName] = useState(blog.internalName ?? "");
  const [date, setDate] = useState(
    blog.date ? blog.date.slice(0, 10) : ""
  );
  const [categoryId, setCategoryId] = useState(blog.categoryId ?? "");

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories({ PageSize: 100 }).then((r) => r.data),
  });

  const categories = categoriesData?.values ?? [];

  const updateMutation = useMutation({
    mutationFn: () =>
      updateBlog(id, {
        internalName: internalName || null,
        date: date ? new Date(date).toISOString() : null,
        categoryId: categoryId || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blog", id] });
      router.push(`/${locale}/blogs`);
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

      {updateMutation.error && (
        <p className="text-sm text-destructive">
          {(updateMutation.error as Error).message ?? "An error occurred."}
        </p>
      )}

      <div className="flex items-center gap-2 pt-2">
        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? "Saving…" : "Save Changes"}
        </Button>
        <Button variant="outline" render={<Link href={`/${locale}/blogs`} />}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ─── Main Edit Client ──────────────────────────────────────────────────────────

export default function BlogEditClient({ id }: { id: string }) {
  const pathname = usePathname();
  const locale = pathname.split("/")[1];

  const { data: blogData, isLoading, isError } = useQuery({
    queryKey: ["blog", id],
    queryFn: () => getBlogById(id).then((r) => r.data),
  });

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground px-4 py-6">Loading…</p>
    );
  }

  if (isError || !blogData) {
    return (
      <p className="text-sm text-destructive px-4 py-6">
        Failed to load blog.
      </p>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Edit Blog</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="translations">Translations</TabsTrigger>
          </TabsList>
          <TabsContent value="details">
            <BlogEditForm id={id} blog={blogData} locale={locale} />
          </TabsContent>
          <TabsContent value="translations">
            <BlogTranslationsTab blogId={id} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
