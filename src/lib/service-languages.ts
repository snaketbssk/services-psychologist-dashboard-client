import type { CancelToken, AxiosResponse } from "axios";
import { apiClient } from "@/lib/ApiClient";

// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface ILanguageDto {
  id: string;
  code: string;
  isDefault: boolean;
}

export interface IPagedLanguages {
  totalCount: number;
  values: ILanguageDto[] | null;
}

export interface ILanguagesFilter {
  PageNumber?: number;
  PageSize?: number;
}

export interface ILanguageRequest {
  code: string | null;
}

// ─── API functions ─────────────────────────────────────────────────────────────

export const getLanguages = (
  params?: ILanguagesFilter,
  cancelToken?: CancelToken
): Promise<AxiosResponse<IPagedLanguages>> =>
  apiClient.get("languages", params, cancelToken);

export const createLanguage = (
  data: ILanguageRequest,
  cancelToken?: CancelToken
): Promise<AxiosResponse<ILanguageDto>> =>
  apiClient.post("languages", data, cancelToken);

export const updateLanguage = (
  id: string,
  data: ILanguageRequest,
  cancelToken?: CancelToken
): Promise<AxiosResponse<ILanguageDto>> =>
  apiClient.put(`languages/${id}`, data, cancelToken);

export const deleteLanguage = (
  id: string,
  cancelToken?: CancelToken
): Promise<AxiosResponse<void>> =>
  apiClient.delete(`languages/${id}`, undefined, cancelToken);

export const setDefaultLanguage = (
  id: string,
  cancelToken?: CancelToken
): Promise<AxiosResponse<ILanguageDto>> =>
  apiClient.put(`languages/${id}/default`, {}, cancelToken);
