import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  LoginCredentials,
  LoginResponse,
  User,
  ForgotPasswordRequest,
  VerifyOtpRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  AuthMessageResponse,
} from "@/types/auth";
import { authEndpoints } from "@/services/auth.endpoints";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: async () => ({ data: null }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginCredentials>(authEndpoints.login),
    getProfile: builder.query<User, void>(authEndpoints.getProfile),
    forgotPassword: builder.mutation<AuthMessageResponse, ForgotPasswordRequest>(authEndpoints.forgotPassword),
    verifyOtp: builder.mutation<AuthMessageResponse, VerifyOtpRequest>(authEndpoints.verifyOtp),
    resetPassword: builder.mutation<AuthMessageResponse, ResetPasswordRequest>(authEndpoints.resetPassword),
    changePassword: builder.mutation<AuthMessageResponse, ChangePasswordRequest>(authEndpoints.changePassword),
  }),
});

export const {
  useLoginMutation,
  useGetProfileQuery,
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
} = authApi;