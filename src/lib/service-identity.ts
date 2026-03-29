import { ServiceApi } from "@/lib/ApiClient";

// ─── Identity API client ───────────────────────────────────────────────────────

const identityClient = new ServiceApi({
  baseURL: process.env.NEXT_PUBLIC_IDENTITY_API_URL,
  interceptors: false,
});

// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface AuthenticationSessionDto {
  tokenType: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

export interface ErrorDto {
  errorType: string | null;
  errorDescription: string | null;
  errorArguments: string[] | null;
}

export interface UserDto {
  id: string;
  userName: string | null;
  email: string | null;
  emailConfirmed: boolean;
  phoneNumber: string | null;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  surname: string | null;
  patronymic: string | null;
  matronymic: string | null;
  address: string | null;
  zipCode: string | null;
  languageId: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface RoleDto {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface GetUserInfoResponse {
  user: UserDto;
  roles: RoleDto[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function toFormData(params: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(params)) {
    fd.append(key, value);
  }
  return fd;
}

// ─── Functions ─────────────────────────────────────────────────────────────────

export async function loginWithPassword(
  username: string,
  password: string
): Promise<AuthenticationSessionDto> {
  const response = await identityClient.postForm(
    "/connect/token",
    toFormData({ grantType: "password", username, password })
  );
  return response.data;
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<AuthenticationSessionDto> {
  const response = await identityClient.postForm(
    "/connect/token",
    toFormData({ grantType: "refresh_token", refreshToken })
  );
  return response.data;
}

export async function exchangeCodeForToken(code: string): Promise<AuthenticationSessionDto> {
  const response = await identityClient.postForm(
    "/connect/token",
    toFormData({ grantType: "authorization_code", code })
  );
  return response.data;
}

export async function getUserInfo(accessToken: string): Promise<GetUserInfoResponse> {
  const response = await identityClient.get(
    "/connect/userinfo",
    undefined,
    undefined,
    { Authorization: `Bearer ${accessToken}` }
  );
  return response.data;
}

export async function revokeToken(token: string): Promise<void> {
  await identityClient.post(
    `/connect/revoke?Token=${encodeURIComponent(token)}`,
    {}
  );
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
  accessToken: string
): Promise<void> {
  await identityClient.post(
    "/connect/change-password",
    { currentPassword, newPassword },
    undefined,
    { Authorization: `Bearer ${accessToken}` }
  );
}
