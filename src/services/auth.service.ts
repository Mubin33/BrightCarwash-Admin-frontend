import type {
	LoginCredentials, LoginResponse, User, UserResponse,
	ForgotPasswordRequest, VerifyOtpRequest, ResetPasswordRequest,
	ChangePasswordRequest, AuthMessageResponse,
} from '@/types/auth';
import axiosInstance from '@/lib/axios-instance';
import axios from 'axios';
import { getRefreshToken, getAccessToken } from '@/lib/auth-client';

function mapUser(data: UserResponse['data']): User {
	return {
		id: data.id,
		firstName: data.first_name,
		lastName: data.last_name,
		email: data.email,
		avatar: data.avatar,
		avatar_url: data.avatar_url,
		role: data.roleUsers?.[0]?.role?.name || 'staff',
		permissions: data.permissions || [],
	};
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
	const { data } = await axiosInstance.post<LoginResponse>('/auth/login', credentials);
	return data;
}

export async function getProfile(): Promise<User> {
	const { data } = await axiosInstance.get<UserResponse>('/auth/me');
	return mapUser(data.data);
}

export async function logout(): Promise<void> {
	const token = getAccessToken();
	if (!token) return;
	const payload = JSON.parse(atob(token.split('.')[1]));
	const sessionId = payload.sessionId;
	await axiosInstance.post('/auth/logout', { sessionId });
}

export async function forgotPassword(reqData: ForgotPasswordRequest): Promise<AuthMessageResponse> {
	const { data } = await axiosInstance.post<AuthMessageResponse>('/auth/forgot-password/send-otp', reqData);
	return data;
}

export async function verifyOtp(reqData: VerifyOtpRequest): Promise<AuthMessageResponse> {
	const { data } = await axiosInstance.post<AuthMessageResponse>('/auth/forgot-password/verify-otp', reqData);
	return data;
}

export async function resetPassword(reqData: ResetPasswordRequest): Promise<AuthMessageResponse> {
	const { data } = await axiosInstance.post<AuthMessageResponse>('/auth/forgot-password/reset-password', reqData);
	return data;
}

export async function changePassword(reqData: ChangePasswordRequest): Promise<AuthMessageResponse> {
	const { data } = await axiosInstance.post<AuthMessageResponse>('/auth/change-password', reqData);
	return data;
}

export async function setPassword(reqData: { email: string; token: string; password: string }): Promise<AuthMessageResponse> {
	const { data } = await axiosInstance.post<AuthMessageResponse>('/auth/set-password', reqData);
	return data;
}

export async function refreshAccessToken(): Promise<{ access_token: string; refresh_token: string }> {
	const refreshToken = getRefreshToken();
	if (!refreshToken) throw new Error('No refresh token available');
	const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh-tokens`, { refresh_token: refreshToken });
	return data;
}