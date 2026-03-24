"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  getVideos,
  deleteVideo,
  type IVideoDto,
} from "@/lib/service-videos";
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

// ─── Video Delete Confirm Dialog ───────────────────────────────────────────────

function VideoDeleteDialog({
  video,
  onClose,
}: {
  video: IVideoDto;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const t = useTranslations("DASHBOARD");

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
        {t("CONFIRM_DELETE_PREFIX")}{" "}
        <span className="font-medium text-foreground">{video.title}</span>
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

// ─── Video Row ─────────────────────────────────────────────────────────────────

function VideoRow({ video, locale }: { video: IVideoDto; locale: string }) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const t = useTranslations("DASHBOARD");

  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-3 pl-4 pr-2 text-sm max-w-0 w-full truncate">{video.title}</td>
      <td className="hidden sm:table-cell py-3 px-2 text-sm font-mono text-muted-foreground">
        {video.videoId}
      </td>
      <td className="py-3 px-2 text-sm text-muted-foreground max-w-0 w-[35%] truncate">
        {video.category}
      </td>
      <td className="py-3 pl-2 pr-4">
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/${locale}/videos/${video.id}/edit`}
            className="inline-flex items-center justify-center rounded-md w-9 h-9 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
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
                  title="Delete video"
                />
              }
            >
              <Trash2Icon className="size-4" />
              <span className="sr-only">Delete</span>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("DELETE_VIDEO")}</DialogTitle>
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
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const t = useTranslations("DASHBOARD");

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
        <CardTitle>{t("VIDEOS")}</CardTitle>
        <div className="col-start-2 row-span-2 row-start-1 self-start justify-self-end">
          <Button size="sm" render={<Link href={`/${locale}/videos/create`} />}>
            <PlusIcon className="size-4" />
            <span className="hidden sm:inline">{t("ADD_VIDEO")}</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading && (
          <p className="px-4 py-6 text-sm text-muted-foreground">{t("LOADING")}</p>
        )}

        {isError && (
          <p className="px-4 py-6 text-sm text-destructive">
            {t("FAILED_LOAD_VIDEOS")}
          </p>
        )}

        {!isLoading && !isError && videos.length === 0 && (
          <p className="px-4 py-6 text-sm text-muted-foreground">
            {t("NO_VIDEOS")}
          </p>
        )}

        {videos.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="py-2.5 pl-4 pr-2 text-left text-xs font-medium text-muted-foreground">
                    {t("TITLE")}
                  </th>
                  <th className="hidden sm:table-cell py-2.5 px-2 text-left text-xs font-medium text-muted-foreground">
                    {t("VIDEO_ID")}
                  </th>
                  <th className="py-2.5 px-2 text-left text-xs font-medium text-muted-foreground">
                    {t("CATEGORY")}
                  </th>
                  <th className="py-2.5 pl-2 pr-4 text-right text-xs font-medium text-muted-foreground">
                    {t("ACTIONS")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {videos.map((video) => (
                  <VideoRow key={video.id} video={video} locale={locale} />
                ))}
              </tbody>
            </table>
          </div>
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
      </CardContent>
    </Card>
  );
}
