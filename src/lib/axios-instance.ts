import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { APP_CONFIG } from '@/configs/app.config';
import {
	getAccessToken,
	getRefreshToken,
	setTokens,
	clearTokens,
} from '@/lib/auth-client';

let isRefreshing = false;
let failedQueue: Array<{
	resolve: (token: string) => void;
	reject: (error: Error) => void;
}> = [];

function processQueue(error: Error | null, token: string | null): void {
	failedQueue.forEach(({ resolve, reject }) => {
		if (error) reject(error);
		else if (token) resolve(token);
	});
	failedQueue = [];
}

const axiosInstance = axios.create({
	baseURL: APP_CONFIG.API_BASE_URL,
	withCredentials: false,
	headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		const token = getAccessToken();
		if (token && config.headers) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const originalRequest = error.config as InternalAxiosRequestConfig & {
			_retry?: boolean;
		};


		const isAuthRoute =
			originalRequest?.url?.includes('/auth/login') ||
			originalRequest?.url?.includes('/auth/refresh-tokens') ||
			originalRequest?.url?.includes('/auth/logout');

		if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					failedQueue.push({
						resolve: (token: string) => {
							if (originalRequest.headers) {
								originalRequest.headers.Authorization = `Bearer ${token}`;
							}
							resolve(axiosInstance(originalRequest));
						},
						reject,
					});
				});
			}

			originalRequest._retry = true;
			isRefreshing = true;

			const refreshToken = getRefreshToken();
			if (!refreshToken) {
				isRefreshing = false;
				clearTokens();
				if (typeof window !== 'undefined')
					window.location.href = '/login?expired=true';
				return Promise.reject(error);
			}

			try {
				const { data } = await axios.post(
					`${APP_CONFIG.API_BASE_URL}/auth/refresh-tokens`,
					{
						refresh_token: refreshToken,
					},
				);
				const newAccessToken =
					data.authorization?.access_token || data.access_token;
				const newRefreshToken =
					data.authorization?.refresh_token || data.refresh_token;
				setTokens(newAccessToken, newRefreshToken);
				processQueue(null, newAccessToken);
				if (originalRequest.headers) {
					originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
				}
				return axiosInstance(originalRequest);
			} catch (refreshError) {
				processQueue(refreshError as Error, null);
				clearTokens();
				if (typeof window !== 'undefined')
					window.location.href = '/login?expired=true';
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}

		return Promise.reject(error);
	},
);

export default axiosInstance;
