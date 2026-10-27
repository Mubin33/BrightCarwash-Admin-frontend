import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { User, AuthState } from "@/types/auth";
import { isAuthenticated as checkAuth } from "@/lib/auth-client";

// Hydration-safe initial state (BUG-015):
// Must start identical on server (SSR) and client (initial hydration) to prevent
// hydration mismatch errors. Auth state is synchronized on client mount via AuthProvider (initAuth).
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload && checkAuth();
      state.isLoading = false;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    clearAuth(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
    initAuth(state) {
      const hasToken = checkAuth();
      state.isAuthenticated = hasToken;
      if (!hasToken) {
        state.user = null;
      }
      // If tokens exist but user profile is not yet loaded, remain loading until profile resolves
      state.isLoading = hasToken && !state.user;
    },
  },
});

export const { setUser, setLoading, clearAuth, initAuth } = authSlice.actions;
export default authSlice.reducer;
