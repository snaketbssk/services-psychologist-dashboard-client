import type { CancelToken, AxiosResponse } from "axios";
import { apiClient } from "@/lib/ApiClient";

// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface ICategoryDto {
  id: string;
  internalName: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface IPagedCategories {
  totalCount: number;
  values: ICategoryDto[];
}

export interface ICategoriesFilter {
  PageNumber?: number;
  PageSize?: number;
}

export interface ICategoryRequest {
  internalName: string | null;
}

export interface ICategoryTranslationDto {
  id: string;
  name: string;
  categoryId: string;
  languageId: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface IPagedCategoryTranslations {
  totalCount: number;
  values: ICategoryTranslationDto[];
}

export interface ICategoryTranslationsFilter {
  PageNumber?: number;
  PageSize?: number;
  categoryId?: string;
  languageId?: string;
}

export interface ICreateCategoryTranslationRequest {
  categoryId: string | null;
  languageId: string | null;
  name: string | null;
}

export interface IUpdateCategoryTranslationRequest {
  name: string | null;
}

// ─── Category API functions ────────────────────────────────────────────────────

export const getCategories = (
  params?: ICategoriesFilter,
  cancelToken?: CancelToken
): Promise<AxiosResponse<IPagedCategories>> =>
  apiClient.get("categories", params, cancelToken);

export const getCategoryById = (
  id: string,
  cancelToken?: CancelToken
): Promise<AxiosResponse<ICategoryDto>> =>
  apiClient.get(`categories/${id}`, undefined, cancelToken);

export const createCategory = (
  data: ICategoryRequest,
  cancelToken?: CancelToken
): Promise<AxiosResponse<ICategoryDto>> =>
  apiClient.post("categories", data, cancelToken);

export const updateCategory = (
  id: string,
  data: ICategoryRequest,
  cancelToken?: CancelToken
): Promise<AxiosResponse<ICategoryDto>> =>
  apiClient.put(`categories/${id}`, data, cancelToken);

export const deleteCategory = (
  id: string,
  cancelToken?: CancelToken
): Promise<AxiosResponse<void>> =>
  apiClient.delete(`categories/${id}`, undefined, cancelToken);

// ─── Category Translation API functions ───────────────────────────────────────

export const getCategoryTranslations = (
  params?: ICategoryTranslationsFilter,
  cancelToken?: CancelToken
): Promise<AxiosResponse<IPagedCategoryTranslations>> =>
  apiClient.get("category-translations", params, cancelToken);

export const createCategoryTranslation = (
  data: ICreateCategoryTranslationRequest,
  cancelToken?: CancelToken
): Promise<AxiosResponse<ICategoryTranslationDto>> =>
  apiClient.post("category-translations", data, cancelToken);

export const updateCategoryTranslation = (
  id: string,
  data: IUpdateCategoryTranslationRequest,
  cancelToken?: CancelToken
): Promise<AxiosResponse<ICategoryTranslationDto>> =>
  apiClient.put(`category-translations/${id}`, data, cancelToken);

export const deleteCategoryTranslation = (
  id: string,
  cancelToken?: CancelToken
): Promise<AxiosResponse<void>> =>
  apiClient.delete(`category-translations/${id}`, undefined, cancelToken);
