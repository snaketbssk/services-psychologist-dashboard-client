import type { CancelToken, AxiosResponse } from "axios";
import { apiClient } from "@/lib/ApiClient";

// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface IVideoDto {
  id: string;
  date: string;
  category: string;
  title: string;
  description: string;
  videoId: string;
}

export interface IVideoDetailDto {
  id: string;
  internalName: string;
  referenceId: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface IPagedVideos {
  totalCount: number;
  values: IVideoDto[] | null;
}

export interface IVideosFilter {
  PageNumber?: number;
  PageSize?: number;
}

export interface ICreateVideoRequest {
  internalName: string | null;
  referenceId: string | null;
  categoryId: string | null;
}

export interface IUpdateVideoRequest {
  internalName: string | null;
  referenceId: string | null;
  categoryId: string | null;
}

export interface IVideoTranslationDto {
  id: string;
  name: string;
  description: string;
  videoId: string;
  languageId: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface IPagedVideoTranslations {
  totalCount: number;
  values: IVideoTranslationDto[] | null;
}

export interface IVideoTranslationsFilter {
  PageNumber?: number;
  PageSize?: number;
  VideoId?: string;
  LanguageId?: string;
}

export interface ICreateVideoTranslationRequest {
  videoId: string | null;
  languageId: string | null;
  name: string | null;
  description: string | null;
}

export interface IUpdateVideoTranslationRequest {
  name: string | null;
  description: string | null;
}

// ─── Video API functions ───────────────────────────────────────────────────────

export const getVideos = (
  params?: IVideosFilter,
  cancelToken?: CancelToken
): Promise<AxiosResponse<IPagedVideos>> =>
  apiClient.get("videos", params, cancelToken);

export const getVideoById = (
  id: string,
  cancelToken?: CancelToken
): Promise<AxiosResponse<IVideoDetailDto>> =>
  apiClient.get(`videos/${id}`, undefined, cancelToken);

export const createVideo = (
  data: ICreateVideoRequest,
  cancelToken?: CancelToken
): Promise<AxiosResponse<IVideoDetailDto>> =>
  apiClient.post("videos", data, cancelToken);

export const updateVideo = (
  id: string,
  data: IUpdateVideoRequest,
  cancelToken?: CancelToken
): Promise<AxiosResponse<IVideoDetailDto>> =>
  apiClient.put(`videos/${id}`, data, cancelToken);

export const deleteVideo = (
  id: string,
  cancelToken?: CancelToken
): Promise<AxiosResponse<void>> =>
  apiClient.delete(`videos/${id}`, undefined, cancelToken);

// ─── Video Translation API functions ──────────────────────────────────────────

export const getVideoTranslations = (
  params?: IVideoTranslationsFilter,
  cancelToken?: CancelToken
): Promise<AxiosResponse<IPagedVideoTranslations>> =>
  apiClient.get("video-translations", params, cancelToken);

export const createVideoTranslation = (
  data: ICreateVideoTranslationRequest,
  cancelToken?: CancelToken
): Promise<AxiosResponse<IVideoTranslationDto>> =>
  apiClient.post("video-translations", data, cancelToken);

export const updateVideoTranslation = (
  id: string,
  data: IUpdateVideoTranslationRequest,
  cancelToken?: CancelToken
): Promise<AxiosResponse<IVideoTranslationDto>> =>
  apiClient.put(`video-translations/${id}`, data, cancelToken);

export const deleteVideoTranslation = (
  id: string,
  cancelToken?: CancelToken
): Promise<AxiosResponse<void>> =>
  apiClient.delete(`video-translations/${id}`, undefined, cancelToken);
