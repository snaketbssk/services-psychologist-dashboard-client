/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, {
  AxiosInstance,
  AxiosResponse,
  CancelToken,
  InternalAxiosRequestConfig,
} from "axios";
import { IConfiguration } from "@/types";
import queryParamsBuilder from "@/lib/queryParamsBuilder";
import https from "https";

export interface IServiceApi {
  post(url: string, body: any, cancelToken?: CancelToken, headers?: Record<string, string>): Promise<AxiosResponse>;
  postForm(url: string, formData: FormData, cancelToken?: CancelToken): Promise<AxiosResponse>;
  put(url: string, body: any, cancelToken?: CancelToken): Promise<AxiosResponse>;
  putForm(url: string, formData: FormData, cancelToken?: CancelToken): Promise<AxiosResponse>;
  patch(url: string, body: any, cancelToken?: CancelToken): Promise<AxiosResponse>;
  get(url: string, params?: any, cancelToken?: CancelToken, headers?: Record<string, string>): Promise<AxiosResponse>;
  delete(url: string, data: any, cancelToken?: CancelToken): Promise<AxiosResponse>;
}

export class ServiceApi implements IServiceApi {
  instance: AxiosInstance;

  constructor({ baseURL, interceptors }: IConfiguration) {
    const httpsAgent =
      typeof window === "undefined" && process.env.NODE_ENV !== "production"
        ? new https.Agent({ rejectUnauthorized: false })
        : undefined;

    this.instance = axios.create({ baseURL, httpsAgent });

    if (!interceptors) return;

    // Request interceptor — on the client side, auto-inject X-Language from the URL locale segment
    this.instance.interceptors.request.use((config: InternalAxiosRequestConfig<any>) => {
      if (typeof window !== "undefined") {
        const locale = window.location.pathname.split("/")[1] || "en";
        config.headers["X-Language"] = locale;
      }
      return config;
    });

    // Response interceptor — handles errors without login redirects
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => Promise.reject(error)
    );
  }

  post(url: string, body: any, cancelToken?: CancelToken, headers?: Record<string, string>): Promise<AxiosResponse> {
    return this.instance.post(url, body, { cancelToken, headers });
  }

  postForm(url: string, formData: FormData, cancelToken?: CancelToken): Promise<AxiosResponse> {
    return this.instance.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      cancelToken,
    });
  }

  put(url: string, body: any, cancelToken?: CancelToken): Promise<AxiosResponse> {
    return this.instance.put(url, body, { cancelToken });
  }

  putForm(url: string, formData: FormData, cancelToken?: CancelToken): Promise<AxiosResponse> {
    return this.instance.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      cancelToken,
    });
  }

  patch(url: string, body: any, cancelToken?: CancelToken): Promise<AxiosResponse> {
    return this.instance.patch(url, body, { cancelToken });
  }

  get(url: string, params?: any, cancelToken?: CancelToken, headers?: Record<string, string>): Promise<AxiosResponse> {
    const queryString = params ? `?${queryParamsBuilder(params)}` : "";
    return this.instance.get(`${url}${queryString}`, { cancelToken, headers });
  }

  delete(url: string, data: any, cancelToken?: CancelToken): Promise<AxiosResponse> {
    return this.instance.delete(url, { data, cancelToken });
  }
}

// Pre-configured instance — import this throughout the app
export const apiClient = new ServiceApi({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  interceptors: true,
});
