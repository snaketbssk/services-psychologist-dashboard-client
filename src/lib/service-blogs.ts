import type { CancelToken, AxiosResponse } from "axios";
import { apiClient } from "@/lib/ApiClient";

// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface IBlogShortDto {
  id: string;
  internalName: string;
  date: string;
  categoryId: string;
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
  values: IBlogShortDto[] | null;
}

export interface IBlogsFilter {
  PageNumber?: number;
  PageSize?: number;
}

export interface IBlogTranslationsFilter {
  PageNumber?: number;
  PageSize?: number;
  BlogId?: string;
  LanguageId?: string;
}

export interface IPagedBlogTranslations {
  totalCount: number;
  values: IBlogTranslationDto[] | null;
}

export interface ICreateBlogRequest {
  categoryId: string | null;
  internalName: string | null;
  date: string | null;
}

export interface IUpdateBlogRequest {
  categoryId: string | null;
  internalName: string | null;
  date: string | null;
}

export interface IBlogTranslationDto {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  blogId: string;
  languageId: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface ICreateBlogTranslationRequest {
  blogId: string | null;
  languageId: string | null;
  title: string | null;
  excerpt: string | null;
  content: string | null;
}

export interface IUpdateBlogTranslationRequest {
  title: string | null;
  excerpt: string | null;
  content: string | null;
}

// ─── Blog API functions ────────────────────────────────────────────────────────

export const getBlogs = (
  params?: IBlogsFilter,
  cancelToken?: CancelToken
): Promise<AxiosResponse<IPagedBlogs>> =>
  apiClient.get("blogs", params, cancelToken);

export const getBlogById = (
  id: string,
  cancelToken?: CancelToken
): Promise<AxiosResponse<IBlogDto>> =>
  apiClient.get(`blogs/${id}`, undefined, cancelToken);

export const createBlog = (
  data: ICreateBlogRequest,
  cancelToken?: CancelToken
): Promise<AxiosResponse<IBlogDto>> =>
  apiClient.post("blogs", data, cancelToken);

export const updateBlog = (
  id: string,
  data: IUpdateBlogRequest,
  cancelToken?: CancelToken
): Promise<AxiosResponse<IBlogDto>> =>
  apiClient.put(`blogs/${id}`, data, cancelToken);

export const deleteBlog = (
  id: string,
  cancelToken?: CancelToken
): Promise<AxiosResponse<void>> =>
  apiClient.delete(`blogs/${id}`, undefined, cancelToken);

// ─── Blog Translation API functions ───────────────────────────────────────────

export const getBlogTranslations = (
  params?: IBlogTranslationsFilter,
  cancelToken?: CancelToken
): Promise<AxiosResponse<IPagedBlogTranslations>> =>
  apiClient.get("blog-translations", params, cancelToken);

export const createBlogTranslation = (
  data: ICreateBlogTranslationRequest,
  cancelToken?: CancelToken
): Promise<AxiosResponse<IBlogTranslationDto>> =>
  apiClient.post("blog-translations", data, cancelToken);

export const updateBlogTranslation = (
  id: string,
  data: IUpdateBlogTranslationRequest,
  cancelToken?: CancelToken
): Promise<AxiosResponse<IBlogTranslationDto>> =>
  apiClient.put(`blog-translations/${id}`, data, cancelToken);

export const deleteBlogTranslation = (
  id: string,
  cancelToken?: CancelToken
): Promise<AxiosResponse<void>> =>
  apiClient.delete(`blog-translations/${id}`, undefined, cancelToken);
