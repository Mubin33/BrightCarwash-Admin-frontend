import type { User, LoginResponse, UserResponse } from "@/types/auth";
import { AUTH_CONFIG } from "@/configs/auth.config";

// Isolated mock credentials for local testing only - never exposed in shared configs or client bundles
const MOCK_CREDENTIALS = {
  email: process.env.NEXT_PUBLIC_MOCK_ADMIN_EMAIL || "mock.admin@example.com",
  password: process.env.NEXT_PUBLIC_MOCK_ADMIN_PASSWORD || "Mock@123!",
};
const MOCK_OTP = "123456";

const MOCK_USER: User = {
  id: "cmqgewibz000078tmnjqzlpti",
  firstName: "Admin",
  lastName: "User",
  email: MOCK_CREDENTIALS.email,
  avatar: null,
  role: "Admin",
  permissions: []
};

const MOCK_OTP_STORE: Map<string, string> = new Map();
let mockAccessToken: string | null = null;
let mockRefreshToken: string | null = null;
let refreshTokenCounter = 0;

function generateMockToken(payload: Record<string, unknown>, expiresInSeconds: number): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(
    JSON.stringify({
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
    })
  );
  return `${header}.${body}.mock_signature`;
}

export function mockLogin(email: string, password: string): LoginResponse {
  if (email !== MOCK_CREDENTIALS.email || password !== MOCK_CREDENTIALS.password) {
    throw new Error("Invalid email or password");
  }

  mockAccessToken = generateMockToken(
    { email, sub: MOCK_USER.id, roles: [MOCK_USER.role] },
    AUTH_CONFIG.ACCESS_TOKEN_MAX_AGE
  );

  mockRefreshToken = generateMockToken(
    { sub: MOCK_USER.id, type: "refresh", jti: String(++refreshTokenCounter) },
    AUTH_CONFIG.REFRESH_TOKEN_MAX_AGE
  );

  return {
    success: true,
    message: "Logged in successfully",
    authorization: {
      type: "bearer",
      access_token: mockAccessToken,
      refresh_token: mockRefreshToken,
    },
    roles: [MOCK_USER.role],
  };
}

export function mockGetProfile(): UserResponse {
  if (!mockAccessToken) throw new Error("Unauthorized");
  const payload = JSON.parse(atob(mockAccessToken.split(".")[1]));
  if (payload.exp < Math.floor(Date.now() / 1000)) throw new Error("Token expired");

  return {
    success: true,
    data: {
      id: MOCK_USER.id,
      first_name: MOCK_USER.firstName,
      last_name: MOCK_USER.lastName,
      email: MOCK_USER.email,
      avatar: MOCK_USER.avatar,
      roleUsers: [{ role: { id: "1", name: MOCK_USER.role } }],
    },
  };
}

export function mockLogout(): void {
  mockAccessToken = null;
  mockRefreshToken = null;
}

export function mockForgotPassword(email: string): void {
  if (email === MOCK_CREDENTIALS.email) {
    MOCK_OTP_STORE.set(email, MOCK_OTP);
  }
}

export function mockVerifyOtp(email: string, otp: string): void {
  const stored = MOCK_OTP_STORE.get(email);
  if (!stored || stored !== otp) throw new Error("Invalid OTP");
}

export function mockResetPassword(email: string, otp: string, _newPassword: string): void {
  void _newPassword;
  mockVerifyOtp(email, otp);
  MOCK_OTP_STORE.delete(email);
}

export function mockChangePassword(oldPassword: string, _newPassword: string): void {
  void _newPassword;
  if (oldPassword !== MOCK_CREDENTIALS.password) {
    throw new Error("Current password is incorrect");
  }
}
