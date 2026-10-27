"use client";

import { filterItemsByPermission } from "@/components/shared/Sidebar";
import { NAVIGATION_CONFIG } from "@/configs/navigation.config";
import {
  clearTokens,
  setTokens,
} from "@/lib/auth-client";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { resetAllApiCaches, useAppDispatch, useAppSelector } from "@/lib/store";
import * as authService from "@/services/auth.service";
import {
  clearAuth,
  setUser,
} from "@/store/slices/authSlice";
import type { LoginCredentials, LoginResult, MfaChallengeData } from "@/types/auth";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "react-toastify";

/**
 * Strict internal relative redirect validator (AUTH-013, A-H1).
 * Guards against open redirect attacks including:
 * - Scheme-relative URLs: //evil.example
 * - Tab/newline stripping bypasses: /%09/evil.example, /\t/evil.example
 * - Backslash protocol escapes: /\evil.example
 * - Absolute URLs with schemes: javascript:, data:, https:
 */
export function isSafeInternalRedirect(url: string | null | undefined): url is string {
  if (!url || typeof url !== "string") return false;
  if (!url.startsWith("/") || url.startsWith("//") || url.startsWith("/\\")) {
    return false;
  }
  if (/[\s\x00-\x1F]/.test(url)) {
    return false;
  }
  if (url.includes("\\") || url.includes(":")) {
    return false;
  }
  try {
    const decoded = decodeURIComponent(url);
    if (
      decoded.startsWith("//") ||
      decoded.startsWith("/\\") ||
      decoded.includes("\\") ||
      decoded.includes(":") ||
      /[\s\x00-\x1F]/.test(decoded)
    ) {
      return false;
    }
  } catch {
    return false;
  }
  try {
    const parsed = new URL(url, "http://localhost");
    return (
      parsed.origin === "http://localhost" &&
      parsed.pathname.startsWith("/") &&
      !parsed.pathname.startsWith("//")
    );
  } catch {
    return false;
  }
}

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector(
    (state) => state.auth,
  );
  const router = useRouter();

  const completeLogin = useCallback(
    async (accessToken: string, refreshToken: string) => {
      setTokens(accessToken, refreshToken);
      const profile = await authService.getProfile();
      dispatch(setUser(profile));
      toast.success("Login successful");

      // Check for safe redirect param from proxy.ts (AUTH-013, A-H1)
      let targetUrl: string | null = null;
      if (typeof window !== "undefined") {
        const searchParams = new URLSearchParams(window.location.search);
        const redirectParam = searchParams.get("redirect");
        if (isSafeInternalRedirect(redirectParam)) {
          targetUrl = redirectParam;
        }
      }

      const canDashboard = hasPermission(profile, [
        PERMISSIONS.dashboard.view,
        "dashboard:*",
      ]);

      if (targetUrl) {
        router.replace(targetUrl);
      } else if (canDashboard) {
        router.replace("/dashboard");
      } else {
        const filteredSections = NAVIGATION_CONFIG.map((section) => ({
          ...section,
          items: filterItemsByPermission(
            section.items,
            profile.permissions || [],
            profile.role,
          ),
        })).filter((s) => s.items.length > 0);
        const firstItem = filteredSections[0]?.items[0];
        const target =
          firstItem?.href || firstItem?.subItems?.[0]?.href || "/dashboard";
        router.replace(target);
      }
      return profile;
    },
    [dispatch, router],
  );

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<LoginResult> => {
      try {
        const response = await authService.login(credentials);

        // Check if server issued a multi-factor authentication challenge (AU15, Issue #147)
        if ("mfaRequired" in response && response.mfaRequired) {
          // Invariant: Do not store tokens, do not fetch profile, nothing protected renders
          return {
            success: false,
            mfaRequired: true,
            challenge: response,
          };
        }
        

        if ("authorization" in response && response.authorization) {
          const profile = await completeLogin(
            response.authorization.access_token,
            response.authorization.refresh_token,
          );
          return { success: true, user: profile };
        }

        throw new Error("Unexpected login response format");
      } catch (err) {
        const error = err as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        clearTokens();
        try {
          sessionStorage.clear();
        } catch {
          // Ignore if sessionStorage is not accessible
        }
        resetAllApiCaches(dispatch);
        dispatch(clearAuth());
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Login failed. Please check your credentials.";
        toast.error(message);
        return { success: false, error: message };
      }
    },
    [completeLogin, dispatch],
  );

  const verifyMfa = useCallback(
    async (challengeToken: string, code: string): Promise<LoginResult> => {
      try {
        const response = await authService.verifyMfa({ challengeToken, code });
        if ("authorization" in response && response.authorization) {
          const profile = await completeLogin(
            response.authorization.access_token,
            response.authorization.refresh_token,
          );
          return { success: true, user: profile };
        }
        throw new Error("Invalid response from multi-factor verification");
      } catch (err) {
        // Invariant: Do not set any session or token on failure; re-throw error for UI retry
        const error = err as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        clearTokens();
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Verification failed. Please check your code.";
        throw new Error(message);
      }
    },
    [completeLogin],
  );

  const cancelMfa = useCallback(() => {
    // Invariant: cancel returns to sign-in with no session or token kept
    clearTokens();
    try {
      sessionStorage.clear();
    } catch {}
    resetAllApiCaches(dispatch);
    dispatch(clearAuth());
  }, [dispatch]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // cleanup anyway
    } finally {
      clearTokens();
      try {
        sessionStorage.clear();
      } catch {
        // Ignore if sessionStorage is not accessible
      }
      resetAllApiCaches(dispatch);
      dispatch(clearAuth());

      // Broadcast logout event to synchronize other open tabs
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        try {
          const channel = new BroadcastChannel("auth_permissions_sync");
          channel.postMessage("logout");
          channel.close();
        } catch {
          // Ignore BroadcastChannel errors
        }
      }

      toast.info("Logged out successfully");

      if (typeof window !== "undefined") {
        window.location.assign("/login");
      } else {
        router.push("/login");
      }
    }
  }, [dispatch, router]);

  return { user, isAuthenticated, isLoading, login, verifyMfa, cancelMfa, logout };
}
