import type {
  LoginCredentials, LoginResponse, User, UserResponse,
  ForgotPasswordRequest, VerifyOtpRequest, ResetPasswordRequest,
  ChangePasswordRequest, AuthMessageResponse,
} from "@/types/auth";
import axiosInstance from "@/lib/axios-instance";

function mapUser(data: UserResponse["data"]): User {
  return {
    id: data.id,
    firstName: data.first_name,
    lastName: data.last_name,
    email: data.email,
    avatar: data.avatar,
    role: data.roleUsers?.[0]?.role?.name || "staff",
    permissions: data.permissions || [],
  };
}

export const authEndpoints = {
  login: {
    queryFn: async (credentials: LoginCredentials) => {
      try {
        const { data } = await axiosInstance.post<LoginResponse>("/auth/login", credentials);
        return { data };
      } catch (error) {
        return { error: { status: 401, data: error instanceof Error ? error.message : "Login failed" } };
      }
    },
  },
  getProfile: {
    queryFn: async () => {
      try {
        const { data } = await axiosInstance.get<UserResponse>("/auth/me");
        return { data: mapUser(data.data) };
      } catch (error) {
        return { error: { status: 401, data: error instanceof Error ? error.message : "Failed to fetch profile" } };
      }
    },
  },
  forgotPassword: {
    queryFn: async (body: ForgotPasswordRequest) => {
      try {
        const { data } = await axiosInstance.post<AuthMessageResponse>("/auth/forgot-password/send-otp", body);
        return { data };
      } catch (error) {
        return { error: { status: 500, data: error instanceof Error ? error.message : "Something went wrong" } };
      }
    },
  },
  verifyOtp: {
    queryFn: async (body: VerifyOtpRequest) => {
      try {
        const { data } = await axiosInstance.post<AuthMessageResponse>("/auth/forgot-password/verify-otp", body);
        return { data };
      } catch (error) {
        return { error: { status: 400, data: error instanceof Error ? error.message : "OTP verification failed" } };
      }
    },
  },
  resetPassword: {
    queryFn: async (body: ResetPasswordRequest) => {
      try {
        const { data } = await axiosInstance.post<AuthMessageResponse>("/auth/forgot-password/reset-password", body);
        return { data };
      } catch (error) {
        return { error: { status: 400, data: error instanceof Error ? error.message : "Reset failed" } };
      }
    },
  },
  changePassword: {
    queryFn: async (body: ChangePasswordRequest) => {
      try {
        const { data } = await axiosInstance.post<AuthMessageResponse>("/auth/change-password", body);
        return { data };
      } catch (error) {
        return { error: { status: 400, data: error instanceof Error ? error.message : "Change password failed" } };
      }
    },
  },
};