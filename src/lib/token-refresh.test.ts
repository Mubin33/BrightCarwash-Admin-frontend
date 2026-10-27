import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  refreshAccessToken,
  setOnSessionExpired,
} from './token-refresh';
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from './auth-client';
import axiosInstance from './axios-instance';
import { logout } from '@/services/auth.service';
import { APP_CONFIG } from '@/configs/app.config';

function createMockJwt(expSec: number, sessionId = 'sess-123'): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ sub: 'user-1', exp: expSec, sessionId })).toString('base64url');
  return `${header}.${payload}.mocksignature`;
}

describe('AU5 (P0) — Token Refresh & Session Revocation (A-1, A-8, A-9, N-8)', () => {
  let cookieStore: Record<string, string> = {};
  let storageStore: Record<string, string> = {};

  beforeEach(() => {
    cookieStore = {};
    storageStore = {};
    vi.restoreAllMocks();

    const mockDocument = {
      get cookie() {
        return Object.entries(cookieStore)
          .map(([k, v]) => `${k}=${v}`)
          .join('; ');
      },
      set cookie(cookieStr: string) {
        const parts = cookieStr.split(';')[0].split('=');
        const key = parts[0]?.trim();
        const val = parts[1]?.trim();
        if (!key) return;
        if (cookieStr.includes('max-age=0')) {
          delete cookieStore[key];
        } else {
          cookieStore[key] = val || '';
        }
      },
    };

    const mockWindow = {
      location: {
        assign: vi.fn(),
      },
      sessionStorage: {
        getItem: (k: string) => storageStore[k] || null,
        setItem: (k: string, v: string) => { storageStore[k] = v; },
        removeItem: (k: string) => { delete storageStore[k]; },
        clear: () => { storageStore = {}; },
      },
      BroadcastChannel: class {
        postMessage = vi.fn();
        close = vi.fn();
      },
    };

    vi.stubGlobal('document', mockDocument);
    vi.stubGlobal('window', mockWindow);
  });

  afterEach(() => {
    clearTokens();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('AU5 / A-1, N-8: Login, refresh, reload', () => {
    it('successfully refreshes token and updates storage on valid refresh token', async () => {
      const initialAccess = createMockJwt(Math.floor(Date.now() / 1000) + 900);
      const initialRefresh = 'refresh-token-valid-1';
      setTokens(initialAccess, initialRefresh);

      expect(getAccessToken()).toBe(initialAccess);
      expect(getRefreshToken()).toBe(initialRefresh);

      const refreshedAccess = createMockJwt(Math.floor(Date.now() / 1000) + 1800);
      const refreshedRefresh = 'refresh-token-valid-2';

      vi.spyOn(axios, 'post').mockResolvedValueOnce({
        data: {
          authorization: {
            access_token: refreshedAccess,
            refresh_token: refreshedRefresh,
          },
        },
      });

      const result = await refreshAccessToken();

      expect(result).toBe(refreshedAccess);
      expect(getAccessToken()).toBe(refreshedAccess);
      expect(getRefreshToken()).toBe(refreshedRefresh);
      expect(axios.post).toHaveBeenCalledWith(
        `${APP_CONFIG.API_BASE_URL}/auth/refresh-tokens`,
        { refresh_token: initialRefresh },
        { timeout: 15000 },
      );
    });
  });

  describe('AU5 / N-8: Transient errors (timeout, 500, offline) vs terminal 401', () => {
    it('handles refresh timeout (15s) as transient error without prematurely purging draft', async () => {
      setTokens('access-token-1', 'refresh-token-1');
      storageStore['campaign_draft'] = JSON.stringify({ title: 'Important Draft' });
      const expiredHandler = vi.fn();
      setOnSessionExpired(expiredHandler);

      const timeoutError = new Error('timeout of 15000ms exceeded');
      (timeoutError as unknown as { code: string }).code = 'ECONNABORTED';
      vi.spyOn(axios, 'post').mockRejectedValue(timeoutError);

      await expect(refreshAccessToken()).rejects.toThrow('timeout of 15000ms exceeded');
      // Draft and tokens are preserved during transient failures (A-8)
      expect(storageStore['campaign_draft']).toBeDefined();
      expect(getAccessToken()).toBe('access-token-1');
      expect(getRefreshToken()).toBe('refresh-token-1');
      expect(expiredHandler).not.toHaveBeenCalled();
      expect(globalThis.window.location.assign).not.toHaveBeenCalled();
    });

    it('handles 500 server error as transient failure without logging out', async () => {
      setTokens('access-token-1', 'refresh-token-1');
      const expiredHandler = vi.fn();
      setOnSessionExpired(expiredHandler);

      const error500 = new Error('Internal Server Error');
      (error500 as unknown as { response: { status: number } }).response = { status: 500 };
      vi.spyOn(axios, 'post').mockRejectedValue(error500);

      await expect(refreshAccessToken()).rejects.toThrow('Internal Server Error');
      expect(getAccessToken()).toBe('access-token-1');
      expect(getRefreshToken()).toBe('refresh-token-1');
      expect(expiredHandler).not.toHaveBeenCalled();
      expect(globalThis.window.location.assign).not.toHaveBeenCalled();
    });

    it('handles offline / network error as transient failure without logging out', async () => {
      setTokens('access-token-1', 'refresh-token-1');
      const expiredHandler = vi.fn();
      setOnSessionExpired(expiredHandler);

      const networkError = new Error('Network Error');
      vi.spyOn(axios, 'post').mockRejectedValue(networkError);

      await expect(refreshAccessToken()).rejects.toThrow('Network Error');
      expect(getAccessToken()).toBe('access-token-1');
      expect(getRefreshToken()).toBe('refresh-token-1');
      expect(expiredHandler).not.toHaveBeenCalled();
      expect(globalThis.window.location.assign).not.toHaveBeenCalled();
    });

    it('holds back token replay on transient error to prevent tripping backend token reuse detection and keeps session intact', async () => {
      setTokens('access-token-1', 'refresh-token-1');
      const networkError = new Error('Network Error');
      const postSpy = vi.spyOn(axios, 'post').mockRejectedValueOnce(networkError);

      await expect(refreshAccessToken()).rejects.toThrow('Network Error');
      // Must not replay the same refresh token to avoid tripping backend reuse detection (which logs users out everywhere)
      expect(postSpy).toHaveBeenCalledTimes(1);
      // Session and tokens must remain intact
      expect(getAccessToken()).toBe('access-token-1');
      expect(getRefreshToken()).toBe('refresh-token-1');
    });

    it('terminal 401 on refresh triggers session expired and purges tokens', async () => {
      setTokens('access-token-expired', 'refresh-token-revoked');
      const expiredHandler = vi.fn();
      setOnSessionExpired(expiredHandler);

      const error401 = new Error('Unauthorized');
      (error401 as unknown as { response: { status: number } }).response = { status: 401 };
      vi.spyOn(axios, 'post').mockRejectedValue(error401);

      await expect(refreshAccessToken()).rejects.toThrow();
      expect(expiredHandler).toHaveBeenCalled();
      expect(getAccessToken()).toBeNull();
      expect(getRefreshToken()).toBeNull();
      expect(globalThis.window.location.assign).toHaveBeenCalledWith('/login?expired=true');
    });
  });

  describe('AU5 / A-8, N-8: Retried refresh after lost reply keeps session (no reuse trip)', () => {
    it('reuses token when another tab/call updated access token during refresh wait', async () => {
      const initialAccess = 'access-token-initial';
      setTokens(initialAccess, 'refresh-token-1');

      const updatedAccess = 'access-token-refreshed-by-other-tab';
      vi.spyOn(axios, 'post').mockImplementationOnce(async () => {
        setTokens(updatedAccess, 'refresh-token-2');
        return {
          data: {
            access_token: updatedAccess,
          },
        };
      });

      const token = await refreshAccessToken();
      expect(token).toBe(updatedAccess);
      expect(getAccessToken()).toBe(updatedAccess);
    });
  });

  describe('AU5 / A-8: Two tabs/callers refreshing at once without navigator.locks', () => {
    it('deduplicates concurrent refresh requests into a single network call', async () => {
      setTokens('access-concurrent', 'refresh-concurrent');
      const refreshedAccess = 'access-concurrent-refreshed';

      let resolveCall: (val: unknown) => void;
      const delayedPromise = new Promise((resolve) => {
        resolveCall = resolve;
      });

      const postSpy = vi.spyOn(axios, 'post').mockImplementationOnce(() => delayedPromise as unknown as ReturnType<typeof axios.post>);

      // Trigger two concurrent refresh calls (tests failedQueue promise sharing)
      const p1 = refreshAccessToken();
      const p2 = refreshAccessToken();

      // Resolve the single network call
      resolveCall!({
        data: {
          authorization: {
            access_token: refreshedAccess,
            refresh_token: 'refresh-concurrent-2',
          },
        },
      });

      const [res1, res2] = await Promise.all([p1, p2]);

      expect(res1).toBe(refreshedAccess);
      expect(res2).toBe(refreshedAccess);
      // Only 1 axios.post call was made
      expect(postSpy).toHaveBeenCalledTimes(1);
    });

    it('drains queued refresh promises with an error and does not hang when refresh fails', async () => {
      setTokens('access-concurrent', 'refresh-concurrent');

      let rejectCall: (err: unknown) => void;
      const delayedPromise = new Promise((_, reject) => {
        rejectCall = reject;
      });

      vi.spyOn(axios, 'post').mockImplementationOnce(() => delayedPromise as unknown as ReturnType<typeof axios.post>);

      const p1 = refreshAccessToken();
      const p2 = refreshAccessToken();

      const refreshError = new Error('Network failure during refresh');
      rejectCall!(refreshError);

      await expect(p1).rejects.toThrow('Network failure during refresh');
      await expect(p2).rejects.toThrow('Network failure during refresh');
    });
  });

  describe('AU5 / A-9: Logout with an expired access token (Finding A-9)', () => {
    it('proactively refreshes expired access token and revokes session and refresh token on logout', async () => {
      // Expired access token (5 minutes ago)
      const expiredAccess = createMockJwt(Math.floor(Date.now() / 1000) - 300, 'session-abc-456');
      const validRefresh = 'valid-refresh-token-xyz';
      setTokens(expiredAccess, validRefresh);

      const refreshedAccess = createMockJwt(Math.floor(Date.now() / 1000) + 900, 'session-abc-456');

      // Mock refresh endpoint
      const postSpy = vi.spyOn(axios, 'post').mockResolvedValue({
        data: {
          authorization: {
            access_token: refreshedAccess,
            refresh_token: 'refreshed-refresh-token',
          },
        },
      });

      // Mock axiosInstance.post for /auth/logout
      const logoutSpy = vi.spyOn(axiosInstance, 'post').mockResolvedValue({
        data: { message: 'Logged out successfully' },
      });

      await logout();

      // Proves token was refreshed before logout
      expect(postSpy).toHaveBeenCalledWith(
        expect.stringContaining('/auth/refresh-tokens'),
        expect.objectContaining({ refresh_token: validRefresh }),
        expect.any(Object),
      );

      // Proves logout was called with both sessionId and refresh_token
      expect(logoutSpy).toHaveBeenCalledWith(
        '/auth/logout',
        expect.objectContaining({
          sessionId: 'session-abc-456',
          refresh_token: validRefresh,
        }),
      );
    });

    it('allows 401 response interceptor to refresh and retry /auth/logout instead of excluding it', async () => {
      const activeAccess = 'initial-access-token';
      const validRefresh = 'valid-refresh-token-retry';
      setTokens(activeAccess, validRefresh);

      const newAccess = 'refreshed-access-token-after-401';

      // Mock refresh token call when 401 interceptor fires
      const refreshSpy = vi.spyOn(axios, 'post').mockResolvedValue({
        data: {
          authorization: {
            access_token: newAccess,
            refresh_token: 'refreshed-refresh-2',
          },
        },
      });

      let attempt = 0;
      const originalAdapter = axiosInstance.defaults.adapter;
      axiosInstance.defaults.adapter = async (config) => {
        attempt++;
        if (attempt === 1) {
          const error = new AxiosError(
            'Request failed with status code 401',
            'ERR_BAD_REQUEST',
            config as InternalAxiosRequestConfig,
            null,
            {
              status: 401,
              statusText: 'Unauthorized',
              headers: {},
              config: config as InternalAxiosRequestConfig,
              data: { message: 'Expired access token' },
            },
          );
          return Promise.reject(error);
        }
        return {
          status: 200,
          statusText: 'OK',
          headers: {},
          config: config as InternalAxiosRequestConfig,
          data: { message: 'Logged out successfully' },
        };
      };

      try {
        const response = await axiosInstance.post('/auth/logout', { sessionId: 'test-session' });
        expect(response.status).toBe(200);
        expect(response.data.message).toBe('Logged out successfully');
        expect(attempt).toBe(2);
        expect(refreshSpy).toHaveBeenCalledWith(
          expect.stringContaining('/auth/refresh-tokens'),
          expect.any(Object),
          expect.any(Object),
        );
      } finally {
        axiosInstance.defaults.adapter = originalAdapter;
      }
    });
  });
});
