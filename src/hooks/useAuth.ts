"use client";

import { filterItemsByPermission } from "@/components/shared/Sidebar";
import { NAVIGATION_CONFIG } from "@/configs/navigation.config";
import {
  isAuthenticated as checkAuth,
  clearTokens,
  setTokens,
} from "@/lib/auth-client";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import * as authService from "@/services/auth.service";
import {
  clearAuth,
  initAuth,
  setLoading,
  setUser,
} from "@/store/slices/authSlice";
import type { LoginCredentials } from "@/types/auth";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { toast } from "react-toastify";

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector(
    (state) => state.auth,
  );
  const router = useRouter();

  useEffect(() => {
    dispatch(initAuth());
  }, [dispatch]);

  useEffect(() => {
    if (checkAuth() && !user) {
      dispatch(setLoading(true));
      authService
        .getProfile()
        .then((profile) => dispatch(setUser(profile)))
        .catch(() => {
          clearTokens();
          dispatch(clearAuth());
        });
    }
  }, [user, dispatch]);

  // Real-time synchronization across browser tabs and window focus
  useEffect(() => {
    if (typeof window === "undefined") return;

    const refreshProfile = async () => {
      if (checkAuth()) {
        try {
          const profile = await authService.getProfile();
          dispatch(setUser(profile));
        } catch {}
      }
    };

    let channel: BroadcastChannel | null = null;
    if ("BroadcastChannel" in window) {
      channel = new BroadcastChannel("auth_permissions_sync");
      channel.onmessage = () => {
        refreshProfile();
      };
    }

    const handleFocus = () => {
      refreshProfile();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
      if (channel) {
        channel.close();
      }
    };
  }, [dispatch]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        const response = await authService.login(credentials);
        setTokens(
          response.authorization.access_token,
          response.authorization.refresh_token,
        );
        const profile = await authService.getProfile();
        dispatch(setUser(profile));
        toast.success("Login successful");
        const canDashboard = hasPermission(profile, [
          PERMISSIONS.dashboard.view,
          "dashboard:*",
        ]);
        if (canDashboard) {
          router.replace("/dashboard");
        } else {
          const filteredSections = NAVIGATION_CONFIG.map((section) => ({
            ...section,
            items: filterItemsByPermission(
              section.items,
              profile.permissions || [],
            ),
          })).filter((s) => s.items.length > 0);
          const firstItem = filteredSections[0]?.items[0];
          const target =
            firstItem?.href || firstItem?.subItems?.[0]?.href || "/dashboard";
          router.replace(target);
        }
        return true;
      } catch (err) {
        const error = err as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        clearTokens();
        dispatch(clearAuth());
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Login failed. Please check your credentials.";
        toast.error(message);
        return false;
      }
    },
    [dispatch, router],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // cleanup anyway
    } finally {
      clearTokens();
      dispatch(clearAuth());
      router.push("/login");
      toast.info("Logged out successfully");
    }
  }, [dispatch, router]);

  return { user, isAuthenticated, isLoading, login, logout };
}
