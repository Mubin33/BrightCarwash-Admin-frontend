import axios from 'axios';
import { APP_CONFIG } from '@/configs/app.config';
import {
  getRefreshToken,
  setTokens,
  clearTokens,
} from '@/lib/auth-client';

const REFRESH_TIMEOUT = 15000; // 15 seconds strict timeout

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

function processQueue(error: Error | null, token: string | null): void {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    }
  });
  failedQueue = [];
}

export function refreshAccessToken(): Promise<string> {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearTokens();
    if (typeof window !== 'undefined') {
      window.location.href = '/login?expired=true';
    }
    return Promise.reject(new Error('No refresh token available'));
  }

  isRefreshing = true;

  return axios
    .post(
      `${APP_CONFIG.API_BASE_URL}/auth/refresh-tokens`,
      {
        refresh_token: refreshToken,
      },
      {
        timeout: REFRESH_TIMEOUT,
      },
    )
    .then(({ data }) => {
      const newAccessToken =
        data.authorization?.access_token || data.access_token;
      const newRefreshToken =
        data.authorization?.refresh_token || data.refresh_token;
      if (!newAccessToken) {
        throw new Error('Refresh response missing access token');
      }
      setTokens(newAccessToken, newRefreshToken || refreshToken);
      processQueue(null, newAccessToken);
      return newAccessToken;
    })
    .catch((refreshError) => {
      processQueue(refreshError as Error, null);
      clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login?expired=true';
      }
      return Promise.reject(refreshError);
    })
    .finally(() => {
      isRefreshing = false;
    });
}
