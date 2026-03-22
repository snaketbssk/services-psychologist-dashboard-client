"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getVideos,
  createVideo,
  updateVideo,
  deleteVideo,
  getVideoTranslations,
  createVideoTranslation,
  updateVideoTranslation,
  deleteVideoTranslation,
  type IVideoDto,
  type IVideoTranslationDto,
} from "@/lib/service-videos";
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
import { PlusIcon, PencilIcon, Trash2Icon, LanguagesIcon } from "lucide-react";

// ─── Video Form Dialog ─────────────────────────────────────────────────────────

function VideoFormDialog({
  video,
  onClose,
}: {
  video?: IVideoDto;
  onClose: () => void;
}) {
  const [internalName, setInternalName] = useState("");
  const [referenceId, setReferenceId] = useState(video?.videoId ?? "");
  const [categoryId, setCategoryId] = useState("");
  const queryClient = useQueryClient();

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories({ PageSize: 100 }).then((r) => r.data),
  });

  const categories = categoriesData?.values ?? [];

  const createMutation = useMutation({
    mutationFn: () =>
      createVideo({
        internalName: internalName || null,
        referenceId: referenceId || null,
        categoryId: categoryId || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateVideo(video!.id, {
        internalName: internalName || null,
        referenceId: referenceId || null,
        categoryId: categoryId || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      onClose();
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (video) {
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
          placeholder="e.g. anxiety-video-1"
          className="h-8 rounded-lg border border-border bg-background px-3 text-sm outline-none ring-0 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="referenceId" className="text-sm font-medium">
          Reference ID
        </label>
        <input
          id="referenceId"
          type="text"
          value={referenceId}
          onChange={(e) => setReferenceId(e.target.value)}
          placeholder="e.g. dQw4w9WgXcQ"
          className="h-8 rounded-lg border border-border bg-background px-3 text-sm outline-none ring-0 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
          className="h-8 rounded-lg border border-border bg-background px-3 text-sm outline-none ring-0 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
          {isPending ? "Saving…" : video ? "Save Changes" : "Create"}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ─── Video Delete Confirm Dialog ───────────────────────────────────────────────

function VideoDeleteDialog({
  video,
  onClose,
}: {
  video: IVideoDto;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteVideo(video.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      onClose();
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Are you sure you want to delete{" "}
        <span className="font-medium text-foreground">{video.title}</span>? This
        action cannot be undone.
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

function VideoTranslationFormDialog({
  videoId,
  translation,
  languages,
  onClose,
}: {
  videoId: string;
  translation?: IVideoTranslationDto;
  languages: ILanguageDto[];
  onClose: () => void;
}) {
  const [name, setName] = useState(translation?.name ?? "");
  const [description, setDescription] = useState(
    translation?.description ?? ""
  );
  const [languageId, setLanguageId] = useState(
    translation?.languageId ?? languages[0]?.id ?? ""
  );
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: () =>
      createVideoTranslation({
        videoId,
        languageId: languageId || null,
        name: name || null,
        description: description || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["video-translations", videoId],
      });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateVideoTranslation(translation!.id, {
        name: name || null,
        description: description || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["video-translations", videoId],
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
        <label htmlFor="trans-name" className="text-sm font-medium">
          Name
        </label>
        <input
          id="trans-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Video title"
          className="h-8 rounded-lg border border-border bg-background px-3 text-sm outline-none ring-0 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="trans-description" className="text-sm font-medium">
          Description
        </label>
        <textarea
          id="trans-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Video description"
          rows={3}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-0 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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

function VideoTranslationDeleteDialog({
  videoId,
  translation,
  languageCode,
  onClose,
}: {
  videoId: string;
  translation: IVideoTranslationDto;
  languageCode: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteVideoTranslation(translation.id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["video-translations", videoId],
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

function VideoTranslationRow({
  videoId,
  translation,
  languages,
}: {
  videoId: string;
  translation: IVideoTranslationDto;
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
              <VideoTranslationFormDialog
                videoId={videoId}
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
              <VideoTranslationDeleteDialog
                videoId={videoId}
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

function VideoTranslationsDialog({ video }: { video: IVideoDto }) {
  const [addOpen, setAddOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data: translationsData, isLoading, isError } = useQuery({
    queryKey: ["video-translations", video.id, page],
    queryFn: () =>
      getVideoTranslations({
        VideoId: video.id,
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
          <span className="font-medium text-foreground">{video.title}</span>
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
            <VideoTranslationFormDialog
              videoId={video.id}
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
              <VideoTranslationRow
                key={t.id}
                videoId={video.id}
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

// ─── Video Row ─────────────────────────────────────────────────────────────────

function VideoRow({ video }: { video: IVideoDto }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [translationsOpen, setTranslationsOpen] = useState(false);

  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-3 pl-4 pr-2 text-sm">{video.title}</td>
      <td className="py-3 px-2 text-sm font-mono text-muted-foreground">
        {video.videoId}
      </td>
      <td className="py-3 px-2 text-sm text-muted-foreground">
        {video.category}
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
              <VideoTranslationsDialog video={video} />
            </DialogContent>
          </Dialog>

          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger
              render={
                <Button variant="ghost" size="icon-sm" title="Edit video" />
              }
            >
              <PencilIcon className="size-4" />
              <span className="sr-only">Edit</span>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Video</DialogTitle>
              </DialogHeader>
              <VideoFormDialog
                video={video}
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
                  title="Delete video"
                />
              }
            >
              <Trash2Icon className="size-4" />
              <span className="sr-only">Delete</span>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Video</DialogTitle>
              </DialogHeader>
              <VideoDeleteDialog
                video={video}
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

export default function VideosClient() {
  const [createOpen, setCreateOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["videos", page],
    queryFn: () =>
      getVideos({ PageNumber: page, PageSize: pageSize }).then((r) => r.data),
  });

  const videos = data?.values ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Videos</CardTitle>
        <div className="col-start-2 row-span-2 row-start-1 self-start justify-self-end">
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger render={<Button size="sm" />}>
              <PlusIcon className="size-4" />
              Add Video
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Video</DialogTitle>
              </DialogHeader>
              <VideoFormDialog onClose={() => setCreateOpen(false)} />
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
            Failed to load videos.
          </p>
        )}

        {!isLoading && !isError && videos.length === 0 && (
          <p className="px-4 py-6 text-sm text-muted-foreground">
            No videos found.
          </p>
        )}

        {videos.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="py-2.5 pl-4 pr-2 text-left text-xs font-medium text-muted-foreground">
                  Title
                </th>
                <th className="py-2.5 px-2 text-left text-xs font-medium text-muted-foreground">
                  Video ID
                </th>
                <th className="py-2.5 px-2 text-left text-xs font-medium text-muted-foreground">
                  Category
                </th>
                <th className="py-2.5 pl-2 pr-4 text-right text-xs font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {videos.map((video) => (
                <VideoRow key={video.id} video={video} />
              ))}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <span className="text-xs text-muted-foreground">
              {totalCount} video{totalCount !== 1 ? "s" : ""}
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
