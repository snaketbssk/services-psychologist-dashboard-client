"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogTranslations,
  createBlogTranslation,
  updateBlogTranslation,
  deleteBlogTranslation,
  type IBlogShortDto,
  type IBlogTranslationDto,
} from "@/lib/service-blogs";
import { getCategories } from "@/lib/service-categories";
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
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { PlusIcon, PencilIcon, Trash2Icon, LanguagesIcon } from "lucide-react";

const inputClass =
  "h-8 rounded-lg border border-border bg-background px-3 text-sm outline-none ring-0 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const textareaClass =
  "rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-0 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

// ─── Blog Form Dialog ──────────────────────────────────────────────────────────

function BlogFormDialog({
  blog,
  onClose,
}: {
  blog?: IBlogShortDto;
  onClose: () => void;
}) {
  const [internalName, setInternalName] = useState(blog?.internalName ?? "");
  const [date, setDate] = useState(
    blog?.date ? blog.date.slice(0, 10) : new Date().toISOString().slice(0, 10)
  );
  const [categoryId, setCategoryId] = useState(blog?.categoryId ?? "");
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
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateBlog(blog!.id, {
        internalName: internalName || null,
        date: date ? new Date(date).toISOString() : null,
        categoryId: categoryId || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      onClose();
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (blog) {
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

      {error && (
        <p className="text-sm text-destructive">
          {(error as Error).message ?? "An error occurred."}
        </p>
      )}

      <DialogFooter showCloseButton>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : blog ? "Save Changes" : "Create"}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ─── Blog Delete Confirm Dialog ────────────────────────────────────────────────

function BlogDeleteDialog({
  blog,
  onClose,
}: {
  blog: IBlogShortDto;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteBlog(blog.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      onClose();
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Are you sure you want to delete{" "}
        <span className="font-medium text-foreground">{blog.internalName}</span>
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
      queryClient.invalidateQueries({
        queryKey: ["blog-translations", blogId],
      });
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
      queryClient.invalidateQueries({
        queryKey: ["blog-translations", blogId],
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

// ─── Translation Delete Confirm Dialog ────────────────────────────────────────

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
      queryClient.invalidateQueries({
        queryKey: ["blog-translations", blogId],
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

// ─── Translations Dialog Content ──────────────────────────────────────────────

function BlogTranslationsDialog({ blog }: { blog: IBlogShortDto }) {
  const [addOpen, setAddOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data: translationsData, isLoading, isError } = useQuery({
    queryKey: ["blog-translations", blog.id, page],
    queryFn: () =>
      getBlogTranslations({
        BlogId: blog.id,
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
            {blog.internalName}
          </span>
        </p>
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
              blogId={blog.id}
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
                blogId={blog.id}
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

// ─── Blog Row ──────────────────────────────────────────────────────────────────

function BlogRow({ blog }: { blog: IBlogShortDto }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [translationsOpen, setTranslationsOpen] = useState(false);

  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-3 pl-4 pr-2 text-sm font-mono">{blog.internalName}</td>
      <td className="py-3 px-2 text-sm">{blog.title}</td>
      <td className="py-3 px-2 text-sm text-muted-foreground">
        {new Date(blog.date).toLocaleDateString()}
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
              <BlogTranslationsDialog blog={blog} />
            </DialogContent>
          </Dialog>

          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger
              render={
                <Button variant="ghost" size="icon-sm" title="Edit blog" />
              }
            >
              <PencilIcon className="size-4" />
              <span className="sr-only">Edit</span>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Blog</DialogTitle>
              </DialogHeader>
              <BlogFormDialog
                blog={blog}
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
                  title="Delete blog"
                />
              }
            >
              <Trash2Icon className="size-4" />
              <span className="sr-only">Delete</span>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Blog</DialogTitle>
              </DialogHeader>
              <BlogDeleteDialog
                blog={blog}
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

export default function BlogsClient() {
  const [createOpen, setCreateOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["blogs", page],
    queryFn: () =>
      getBlogs({ PageNumber: page, PageSize: pageSize }).then((r) => r.data),
  });

  const blogs = data?.values ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Blogs</CardTitle>
        <div className="col-start-2 row-span-2 row-start-1 self-start justify-self-end">
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger render={<Button size="sm" />}>
              <PlusIcon className="size-4" />
              Add Blog
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Blog</DialogTitle>
              </DialogHeader>
              <BlogFormDialog onClose={() => setCreateOpen(false)} />
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
            Failed to load blogs.
          </p>
        )}

        {!isLoading && !isError && blogs.length === 0 && (
          <p className="px-4 py-6 text-sm text-muted-foreground">
            No blogs found.
          </p>
        )}

        {blogs.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="py-2.5 pl-4 pr-2 text-left text-xs font-medium text-muted-foreground">
                  Internal Name
                </th>
                <th className="py-2.5 px-2 text-left text-xs font-medium text-muted-foreground">
                  Title
                </th>
                <th className="py-2.5 px-2 text-left text-xs font-medium text-muted-foreground">
                  Date
                </th>
                <th className="py-2.5 pl-2 pr-4 text-right text-xs font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => (
                <BlogRow key={blog.id} blog={blog} />
              ))}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <span className="text-xs text-muted-foreground">
              {totalCount} blog{totalCount !== 1 ? "s" : ""}
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
