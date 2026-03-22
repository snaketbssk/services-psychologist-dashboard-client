import type { CancelToken, AxiosResponse } from "axios";
import { apiClient } from "@/lib/ApiClient";

// ─── Request / filter interfaces ──────────────────────────────────────────────

export interface IConsultationRequest {
  name: string;
  email: string;
  phoneNumber: string;
  message?: string;
}

export interface ILaunchFilter {
  [key: string]: unknown;
}

export interface IVideosFilter {
  PageNumber: number;
  PageSize: number;
}

export interface IBlogsFilter {
  PageNumber?: number;
  PageSize?: number;
  FirstRequest?: boolean;
  OrderByDescending?: boolean;
}

export interface IBlogShortDto {
  id: string;
  date: string;
  category: string;
  title: string;
  excerpt: string;
}

export interface IBlogDto extends IBlogShortDto {
  content: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface IPagedBlogs {
  totalCount: number;
  values: IBlogShortDto[];
}

// ─── Response interfaces ───────────────────────────────────────────────────────

export interface IVideoItem {
  id: number | string;
  date: string;
  category?: string;
  title: string;
  description: string;
  videoId: string;
}

export interface IPagedVideos {
  totalCount: number;
  values: IVideoItem[];
}

export interface ILaunchResponse {
  videos?: IPagedVideos;
}

// ─── API functions ─────────────────────────────────────────────────────────────

export const postConsultation = (
  params: IConsultationRequest,
  cancelToken?: CancelToken
): Promise<AxiosResponse> => apiClient.post("consultation", params, cancelToken);

export const getLaunch = (
  params?: ILaunchFilter,
  locale?: string,
  cancelToken?: CancelToken
): Promise<AxiosResponse<ILaunchResponse>> =>
  apiClient.get("launch", params, cancelToken, locale ? { "X-Language": locale } : undefined);

export const getVideos = (
  params: IVideosFilter,
  cancelToken?: CancelToken
): Promise<AxiosResponse<IPagedVideos>> => apiClient.get("videos", params, cancelToken);

export const getBlogs = (
  params?: IBlogsFilter,
  locale?: string,
  cancelToken?: CancelToken
): Promise<AxiosResponse<IPagedBlogs>> =>
  apiClient.get("blogs", params, cancelToken, locale ? { "X-Language": locale } : undefined);

export const getBlogById = (
  id: string,
  locale?: string,
  cancelToken?: CancelToken
): Promise<AxiosResponse<IBlogDto>> =>
  apiClient.get(`blogs/${id}`, undefined, cancelToken, locale ? { "X-Language": locale } : undefined);
