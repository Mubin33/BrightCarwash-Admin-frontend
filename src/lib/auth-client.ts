"use client";

import { AUTH_CONFIG } from "@/configs/auth.config";

function setCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax; secure`;
}

function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0`;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function getAccessToken(): string | null {
  return getCookie(AUTH_CONFIG.ACCESS_TOKEN_COOKIE);
}

export function getRefreshToken(): string | null {
  return getCookie(AUTH_CONFIG.REFRESH_TOKEN_COOKIE);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  setCookie(AUTH_CONFIG.ACCESS_TOKEN_COOKIE, accessToken, AUTH_CONFIG.ACCESS_TOKEN_MAX_AGE);
  setCookie(AUTH_CONFIG.REFRESH_TOKEN_COOKIE, refreshToken, AUTH_CONFIG.REFRESH_TOKEN_MAX_AGE);
}

export function clearTokens(): void {
  deleteCookie(AUTH_CONFIG.ACCESS_TOKEN_COOKIE);
  deleteCookie(AUTH_CONFIG.REFRESH_TOKEN_COOKIE);
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}