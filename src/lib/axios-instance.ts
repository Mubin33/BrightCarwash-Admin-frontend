import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { APP_CONFIG } from '@/configs/app.config';
import { getAccessToken } from '@/lib/auth-client';
import { refreshAccessToken } from '@/lib/token-refresh';

export const DEFAULT_REQUEST_TIMEOUT = 30000; // 30 seconds default
export const UPLOAD_REQUEST_TIMEOUT = 120000; // 2 minutes for file uploads

const axiosInstance = axios.create({
	baseURL: APP_CONFIG.API_BASE_URL,
	withCredentials: false,
	timeout: DEFAULT_REQUEST_TIMEOUT,
	headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		const token = getAccessToken();
		if (token && config.headers) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		if (config.data instanceof FormData) {
			if (config.headers) {
				if (typeof config.headers.delete === 'function') {
					config.headers.delete('Content-Type');
				} else {
					delete config.headers['Content-Type'];
				}
			}
			// Automatically extend timeout for FormData uploads if not explicitly set
			if (config.timeout === DEFAULT_REQUEST_TIMEOUT || !config.timeout) {
				config.timeout = UPLOAD_REQUEST_TIMEOUT;
			}
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
			originalRequest._retry = true;

			try {
				const newAccessToken = await refreshAccessToken();
				if (originalRequest.headers) {
					originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
				}
				return axiosInstance(originalRequest);
			} catch (refreshError) {
				return Promise.reject(refreshError);
			}
		}

		if (error.code === 'ECONNABORTED' || error.message?.toLowerCase().includes('timeout')) {
			error.message = 'Request timed out. Please check your internet connection and try again.';
		}

		return Promise.reject(error);
	},
);

export default axiosInstance;
