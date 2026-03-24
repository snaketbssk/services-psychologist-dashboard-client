"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getVideoById,
  updateVideo,
  getVideoTranslations,
  createVideoTranslation,
  updateVideoTranslation,
  deleteVideoTranslation,
  type IVideoDetailDto,
  type IVideoTranslationDto,
} from "@/lib/service-videos";
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
import { PlusIcon, PencilIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";

const inputClass =
  "h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none ring-0 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const textareaClass =
  "rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-0 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

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
  const t = useTranslations("DASHBOARD");
  const [languageId, setLanguageId] = useState(
    translation?.languageId ?? languages[0]?.id ?? ""
  );
  const [name, setName] = useState(translation?.name ?? "");
  const [description, setDescription] = useState(translation?.description ?? "");
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
      queryClient.invalidateQueries({ queryKey: ["video-translations", videoId] });
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
      queryClient.invalidateQueries({ queryKey: ["video-translations", videoId] });
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
            {t("LANGUAGE")}
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
        <label htmlFor="trans-name" className="text-sm font-medium">
          {t("NAME")}
        </label>
        <input
          id="trans-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Video title"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="trans-description" className="text-sm font-medium">
          {t("DESCRIPTION")}
        </label>
        <textarea
          id="trans-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Video description"
          rows={3}
          className={textareaClass}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">
          {(error as Error).message ?? "An error occurred."}
        </p>
      )}

      <DialogFooter showCloseButton>
        <Button type="submit" disabled={isPending}>
          {isPending ? t("SAVING") : translation ? t("SAVE_CHANGES") : t("ADD")}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ─── Translation Delete Dialog ─────────────────────────────────────────────────

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
  const t = useTranslations("DASHBOARD");

  const deleteMutation = useMutation({
    mutationFn: () => deleteVideoTranslation(translation.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video-translations", videoId] });
      onClose();
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {t("CONFIRM_DELETE_TRANS_THE")}{" "}
        <span className="font-medium text-foreground">{languageCode}</span>{" "}
        {t("CONFIRM_DELETE_TRANS_WORD")}{" "}
        <span className="font-medium text-foreground">
          &ldquo;{translation.name}&rdquo;
        </span>
        {t("CONFIRM_DELETE_SUFFIX")}
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
          {deleteMutation.isPending ? t("DELETING") : t("DELETE")}
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
  const t = useTranslations("DASHBOARD");
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
                <DialogTitle>{t("EDIT_TRANSLATION")}</DialogTitle>
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
                <DialogTitle>{t("DELETE_TRANSLATION")}</DialogTitle>
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

// ─── Translations Tab Content ──────────────────────────────────────────────────

function VideoTranslationsTab({ videoId }: { videoId: string }) {
  const [addOpen, setAddOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const t = useTranslations("DASHBOARD");

  const { data: translationsData, isLoading, isError } = useQuery({
    queryKey: ["video-translations", videoId, page],
    queryFn: () =>
      getVideoTranslations({
        VideoId: videoId,
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
            {t("ADD")}
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("ADD_TRANSLATION")}</DialogTitle>
            </DialogHeader>
            <VideoTranslationFormDialog
              videoId={videoId}
              languages={languages}
              onClose={() => setAddOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && (
        <p className="px-4 py-6 text-sm text-muted-foreground">{t("LOADING")}</p>
      )}
      {isError && (
        <p className="px-4 py-6 text-sm text-destructive">
          {t("FAILED_LOAD_TRANSLATIONS")}
        </p>
      )}
      {!isLoading && !isError && translations.length === 0 && (
        <p className="px-4 py-6 text-sm text-muted-foreground">
          {t("NO_TRANSLATIONS")}
        </p>
      )}
      {translations.length > 0 && (
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="py-2 pl-4 pr-2 text-left text-xs font-medium text-muted-foreground">
                {t("LANG")}
              </th>
              <th className="py-2 px-2 text-left text-xs font-medium text-muted-foreground">
                {t("NAME")}
              </th>
              <th className="py-2 pl-2 pr-4 text-right text-xs font-medium text-muted-foreground">
                {t("ACTIONS")}
              </th>
            </tr>
          </thead>
          <tbody>
            {translations.map((item) => (
              <VideoTranslationRow
                key={item.id}
                videoId={videoId}
                translation={item}
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
              {t("PREVIOUS")}
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
              {t("NEXT")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Video Edit Form ───────────────────────────────────────────────────────────

function VideoEditForm({
  id,
  video,
  locale,
}: {
  id: string;
  video: IVideoDetailDto;
  locale: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations("DASHBOARD");

  const [internalName, setInternalName] = useState(video.internalName ?? "");
  const [referenceId, setReferenceId] = useState(video.referenceId ?? "");
  const [categoryId, setCategoryId] = useState(video.categoryId ?? "");

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories({ PageSize: 100 }).then((r) => r.data),
  });

  const categories = categoriesData?.values ?? [];

  const updateMutation = useMutation({
    mutationFn: () =>
      updateVideo(id, {
        internalName: internalName || null,
        referenceId: referenceId || null,
        categoryId: categoryId || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      queryClient.invalidateQueries({ queryKey: ["video", id] });
      router.push(`/${locale}/videos`);
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
          {t("INTERNAL_NAME")}
        </label>
        <input
          id="internalName"
          type="text"
          value={internalName}
          onChange={(e) => setInternalName(e.target.value)}
          placeholder="e.g. anxiety-video-1"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="referenceId" className="text-sm font-medium">
          {t("REFERENCE_ID")}
        </label>
        <input
          id="referenceId"
          type="text"
          value={referenceId}
          onChange={(e) => setReferenceId(e.target.value)}
          placeholder="e.g. dQw4w9WgXcQ"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="categoryId" className="text-sm font-medium">
          {t("CATEGORY")}
        </label>
        <select
          id="categoryId"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className={inputClass}
        >
          <option value="">{t("SELECT_CATEGORY")}</option>
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
          {updateMutation.isPending ? t("SAVING") : t("SAVE_CHANGES")}
        </Button>
        <Button variant="outline" render={<Link href={`/${locale}/videos`} />}>
          {t("CANCEL")}
        </Button>
      </div>
    </form>
  );
}

// ─── Main Edit Client ──────────────────────────────────────────────────────────

export default function VideoEditClient({ id }: { id: string }) {
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const t = useTranslations("DASHBOARD");

  const { data: videoData, isLoading, isError } = useQuery({
    queryKey: ["video", id],
    queryFn: () => getVideoById(id).then((r) => r.data),
    retry: false,
  });

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground px-4 py-6">{t("LOADING")}</p>
    );
  }

  if (isError || !videoData) {
    return (
      <p className="text-sm text-destructive px-4 py-6">
        {t("FAILED_LOAD_VIDEO")}
      </p>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>{t("EDIT_VIDEO")}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">{t("DETAILS")}</TabsTrigger>
            <TabsTrigger value="translations">{t("TRANSLATIONS")}</TabsTrigger>
          </TabsList>
          <TabsContent value="details">
            <VideoEditForm id={id} video={videoData} locale={locale} />
          </TabsContent>
          <TabsContent value="translations">
            <VideoTranslationsTab videoId={id} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
