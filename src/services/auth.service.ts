import { getAccessToken, getRefreshToken } from "@/lib/auth-client";
import axiosInstance from "@/lib/axios-instance";
import type {
  AuthMessageResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginCredentials,
  LoginResponse,
  LoginApiResponse,
  MfaVerifyRequest,
  ResetPasswordRequest,
  User,
  UserResponse,
  VerifyOtpRequest,
} from "@/types/auth";
import axios from "axios";
import { refreshAccessToken as refreshTokensClient } from "@/lib/token-refresh";

function mapUser(data: UserResponse["data"]): User {
  const roleNames =
    data.roleUsers?.map((r) => r.role?.name).filter(Boolean) || [];
  const roleIds = data.roleUsers?.map((r) => r.role?.id).filter(Boolean) || [];
  return {
    id: data.id,
    firstName: data.first_name,
    lastName: data.last_name,
    email: data.email,
    avatar: data.avatar,
    avatar_url: data.avatar_url,
    role: data.roleUsers?.[0]?.role?.name || "staff",
    roleId: data.roleUsers?.[0]?.role?.id,
    roles: roleNames,
    roleIds: roleIds,
    permissions: data.permissions || [],
  };
}

export async function login(
  credentials: LoginCredentials,
): Promise<LoginApiResponse> {
  const { data } = await axiosInstance.post<LoginApiResponse>(
    "/auth/login",
    credentials,
  );
  return data;
}

export async function verifyMfa(
  reqData: MfaVerifyRequest,
): Promise<LoginResponse> {
  const { data } = await axiosInstance.post<LoginResponse>(
    "/auth/login/mfa",
    reqData,
  );
  return data;
}

export async function getProfile(): Promise<User> {
  const { data } = await axiosInstance.get<UserResponse>("/auth/me");
  return mapUser(data.data);
}

interface TokenPayload {
  sessionId?: string;
  exp?: number;
  [key: string]: unknown;
}

function parseTokenPayload(token: string): TokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    const jsonPayload = atob(padded);
    return JSON.parse(jsonPayload) as TokenPayload;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  let accessToken = getAccessToken();

  let payload = accessToken ? parseTokenPayload(accessToken) : null;
  const isAccessExpired =
    typeof payload?.exp === "number"
      ? Date.now() >= payload.exp * 1000
      : !accessToken;

  // Proactive refresh before logout if access token is expired/missing but refresh token exists (A-9)
  if (isAccessExpired && refreshToken) {
    try {
      accessToken = await refreshTokensClient();
      payload = accessToken ? parseTokenPayload(accessToken) : null;
    } catch {
      // If refresh fails, proceed to attempt server logout or client cleanup
    }
  }

  const refreshPayload = refreshToken ? parseTokenPayload(refreshToken) : null;
  const sessionId = payload?.sessionId || refreshPayload?.sessionId;

  try {
    await axiosInstance.post("/auth/logout", {
      sessionId,
      refresh_token: refreshToken,
    });
  } catch {
    // Continue client-side session cleanup even if server-side logout encounters an error
  }
}

export async function forgotPassword(
  reqData: ForgotPasswordRequest,
): Promise<AuthMessageResponse> {
  const { data } = await axiosInstance.post<AuthMessageResponse>(
    "/auth/forgot-password/send-otp",
    reqData,
  );
  return data;
}

export async function verifyOtp(
  reqData: VerifyOtpRequest,
): Promise<AuthMessageResponse> {
  const { data } = await axiosInstance.post<AuthMessageResponse>(
    "/auth/forgot-password/verify-otp",
    reqData,
  );
  return data;
}

export async function resetPassword(
  reqData: ResetPasswordRequest,
): Promise<AuthMessageResponse> {
  const { data } = await axiosInstance.post<AuthMessageResponse>(
    "/auth/forgot-password/reset-password",
    reqData,
  );
  return data;
}

export async function changePassword(
  reqData: ChangePasswordRequest,
): Promise<AuthMessageResponse> {
  const { data } = await axiosInstance.post<AuthMessageResponse>(
    "/auth/change-password",
    reqData,
  );
  return data;
}

export async function setPassword(reqData: {
  email: string;
  token: string;
  password: string;
}): Promise<AuthMessageResponse> {
  const { data } = await axiosInstance.post<AuthMessageResponse>(
    "/auth/set-password",
    reqData,
  );
  return data;
}

export async function refreshAccessToken(): Promise<{
  access_token: string;
  refresh_token: string;
}> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token available");
  const { data } = await axios.post(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh-tokens`,
    { refresh_token: refreshToken },
    { timeout: 15000 },
  );
  return data;
}
