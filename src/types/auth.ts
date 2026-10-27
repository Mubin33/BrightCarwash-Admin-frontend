export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  authorization: {
    type: string;
    access_token: string;
    refresh_token: string;
  };
  roles: string[];
}

export interface MfaChallengeData {
  mfaRequired: true;
  challengeToken: string;
  method?: "totp" | "sms" | "email";
  message?: string;
}

export interface MfaVerifyRequest {
  challengeToken: string;
  code: string;
}

export type LoginApiResponse = LoginResponse | MfaChallengeData;

export type LoginResult =
  | { success: true; user: User; mfaRequired?: false; challenge?: never; error?: never }
  | { success: false; mfaRequired: true; challenge: MfaChallengeData; error?: never }
  | { success: false; mfaRequired?: false; error: string; challenge?: never };


export interface UserResponse {
  success: boolean;
  data: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar: string | null;
    avatar_url?: string | undefined;
    phone_number?: string | null;
    roleUsers: {
      role: {
        id: string;
        name: string;
      };
    }[];
    permissions?: string[];
  };
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string | null;
  avatar_url?: string | undefined;
  role: string;
  roleId?: string;
  roles?: string[];
  roleIds?: string[];
  permissions: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  new_password: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface AuthMessageResponse {
  success: boolean;
  message: string;
}
