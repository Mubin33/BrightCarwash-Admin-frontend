import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { User, AuthState } from "@/types/auth";
import { isAuthenticated as checkAuth } from "@/lib/auth-client";

const initialState: AuthState = {
  user: null,
  isAuthenticated: checkAuth(),
  isLoading: false,
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
      state.isAuthenticated = checkAuth();
      state.isLoading = false;
    },
  },
});

export const { setUser, setLoading, clearAuth, initAuth } = authSlice.actions;
export default authSlice.reducer;
