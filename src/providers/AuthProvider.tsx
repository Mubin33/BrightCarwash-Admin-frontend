"use client";

import { useEffect, useRef } from "react";
import { resetAllApiCaches, store, useAppDispatch, useAppSelector } from "@/lib/store";
import { initAuth, setLoading, setUser, clearAuth } from "@/store/slices/authSlice";
import { isAuthenticated as checkAuth, clearTokens } from "@/lib/auth-client";
import * as authService from "@/services/auth.service";

const FOCUS_THROTTLE_MS = 30000; // 30 seconds throttle for window focus refreshes

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const lastRefreshTimeRef = useRef<number>(0);

  // 1. Initialize auth on mount (read tokens/cookies into Redux)
  useEffect(() => {
    dispatch(initAuth());
  }, [dispatch]);

  // 2. Fetch initial profile if authenticated and user profile is not yet loaded in state
  useEffect(() => {
    if (checkAuth() && !user) {
      dispatch(setLoading(true));
      authService
        .getProfile()
        .then((profile) => {
          dispatch(setUser(profile));
        })
        .catch((error) => {
          const status = (error as { response?: { status?: number } })?.response?.status;
          if (status === 401 || status === 403) {
            clearTokens();
            try {
              sessionStorage.clear();
            } catch {
              // Ignore if sessionStorage is not accessible
            }
            resetAllApiCaches(dispatch);
            dispatch(clearAuth());
          } else {
            console.warn("Transient error fetching initial user profile:", error);
            dispatch(setLoading(false));
          }
        });
    }
  }, [user, dispatch]);

  // 3. Centralized synchronization: BroadcastChannel and throttled window focus
  useEffect(() => {
    if (typeof window === "undefined") return;

    const refreshProfile = async (force = false) => {
      if (!checkAuth()) return;

      const now = Date.now();
      if (!force && now - lastRefreshTimeRef.current < FOCUS_THROTTLE_MS) {
        return;
      }
      lastRefreshTimeRef.current = now;

      try {
        const profile = await authService.getProfile();
        const currentUser = store.getState().auth.user;
        // Only dispatch if profile data has actually changed to prevent re-render churn
        if (JSON.stringify(currentUser) !== JSON.stringify(profile)) {
          dispatch(setUser(profile));
        }
      } catch (e) {
        console.warn("Failed to sync user profile in background:", e);
      }
    };

    let channel: BroadcastChannel | null = null;
    if ("BroadcastChannel" in window) {
      channel = new BroadcastChannel("auth_permissions_sync");
      channel.onmessage = (event: MessageEvent) => {
        if (event.data === "logout") {
          clearTokens();
          try {
            sessionStorage.clear();
          } catch {
            // Ignore if sessionStorage is not accessible
          }
          resetAllApiCaches(dispatch);
          dispatch(clearAuth());
          window.location.assign("/login");
          return;
        }
        // Immediate refresh when permissions change across tabs
        refreshProfile(true);
      };
    }

    const handleFocus = () => {
      refreshProfile(false);
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
      if (channel) {
        channel.close();
      }
    };
  }, [dispatch]);

  return <>{children}</>;
}
