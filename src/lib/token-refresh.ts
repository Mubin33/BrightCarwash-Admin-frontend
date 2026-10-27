import axios from 'axios';
import { APP_CONFIG } from '@/configs/app.config';
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from '@/lib/auth-client';

const REFRESH_TIMEOUT = 15000; // 15 seconds strict timeout
const REFRESH_LOCK_NAME = 'brightside_auth_token_refresh_lock';
// Held back until backend NU8 idempotency/grace period is deployed to prevent tripping reuse detection
const MAX_TRANSIENT_RETRIES = 0;
const TRANSIENT_RETRY_DELAY_MS = 500;

function isRefusedRefresh(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const status = (error as { response?: { status?: number } }).response?.status;
  return status === 401 || status === 403;
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

type SessionExpiredHandler = () => void;
let sessionExpiredHandler: SessionExpiredHandler | null = null;

export function setOnSessionExpired(handler: SessionExpiredHandler): void {
  sessionExpiredHandler = handler;
}

function handleSessionExpired(tokenBeforeAttempt?: string | null): void {
  // Guard against race conditions: if another tab already refreshed the access token, abort logout
  if (tokenBeforeAttempt) {
    const currentAccessToken = getAccessToken();
    if (currentAccessToken && currentAccessToken !== tokenBeforeAttempt) {
      return;
    }
  }

  clearTokens();
  if (sessionExpiredHandler) {
    try {
      sessionExpiredHandler();
    } catch (e) {
      console.error('Failed to execute session expired callback:', e);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      sessionStorage.clear();
    } catch {}

    if ('BroadcastChannel' in window) {
      try {
        const channel = new BroadcastChannel('auth_permissions_sync');
        channel.postMessage('logout');
        channel.close();
      } catch {}
    }

    window.location.assign('/login?expired=true');
  }
}

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

async function performRefresh(
  tokenBeforeWait: string | null,
  refreshTokenBeforeWait: string | null,
): Promise<string> {
  // 1. Re-check if another tab already succeeded in refreshing while we waited for the lock
  const currentAccessToken = getAccessToken();
  if (currentAccessToken && tokenBeforeWait && currentAccessToken !== tokenBeforeWait) {
    processQueue(null, currentAccessToken);
    return currentAccessToken;
  }

  const refreshToken = getRefreshToken() || refreshTokenBeforeWait;
  if (!refreshToken) {
    handleSessionExpired(tokenBeforeWait);
    const err = new Error('No refresh token available');
    processQueue(err, null);
    throw err;
  }

  let attempt = 0;

  while (true) {
    try {
      const { data } = await axios.post(
        `${APP_CONFIG.API_BASE_URL}/auth/refresh-tokens`,
        {
          refresh_token: refreshToken,
        },
        {
          timeout: REFRESH_TIMEOUT,
        },
      );

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
    } catch (refreshError) {
      // 2. Before treating as fatal session expiration, check if another tab refreshed concurrently
      const latestAccessToken = getAccessToken();
      if (latestAccessToken && tokenBeforeWait && latestAccessToken !== tokenBeforeWait) {
        processQueue(null, latestAccessToken);
        return latestAccessToken;
      }

      // A-H4 Grace period: wait briefly in case another tab concurrently succeeded
      if (typeof window !== 'undefined') {
        await new Promise((r) => setTimeout(r, 600));
        const retryAccessToken = getAccessToken();
        if (retryAccessToken && tokenBeforeWait && retryAccessToken !== tokenBeforeWait) {
          processQueue(null, retryAccessToken);
          return retryAccessToken;
        }
      }

      const isRefused = isRefusedRefresh(refreshError);

      // Transient errors (timeout, 500, offline): retry once before giving up
      if (!isRefused && attempt < MAX_TRANSIENT_RETRIES) {
        attempt++;
        await new Promise((r) => setTimeout(r, TRANSIENT_RETRY_DELAY_MS));
        const retryToken = getAccessToken();
        if (retryToken && tokenBeforeWait && retryToken !== tokenBeforeWait) {
          processQueue(null, retryToken);
          return retryToken;
        }
        continue;
      }

      // ONLY refused refresh (401/403) logs out every tab and wipes storage
      if (isRefused) {
        processQueue(refreshError as Error, null);
        handleSessionExpired(tokenBeforeWait);
      } else {
        // Transient error keeps session and campaign draft intact (A-8)
        processQueue(refreshError as Error, null);
      }

      throw refreshError;
    }
  }
}

/**
 * Cross-tab mutual exclusion fallback for browsers without Web Locks API (A-H4).
 * Uses localStorage with an automatic lease timeout (6000ms) to prevent deadlocks.
 */
async function requestFallbackLock(
  lockName: string,
  initialAccessToken: string | null,
  action: () => Promise<string>,
): Promise<string> {
  if (typeof window === 'undefined') {
    return await action();
  }

  const LOCK_KEY = `${lockName}_lease`;
  const LOCK_LEASE_MS = 6000;
  const POLL_INTERVAL_MS = 80;
  const MAX_WAIT_MS = 15000;
  const startTime = Date.now();
  const tabId = `${Date.now()}_${Math.random()}`;

  const tryAcquire = (): boolean => {
    try {
      const existing = localStorage.getItem(LOCK_KEY);
      const now = Date.now();
      if (existing) {
        const parsed = JSON.parse(existing);
        if (now < parsed.expiresAt) {
          return false;
        }
      }
      localStorage.setItem(LOCK_KEY, JSON.stringify({ tabId, expiresAt: now + LOCK_LEASE_MS }));
      const check = localStorage.getItem(LOCK_KEY);
      if (check) {
        const parsed = JSON.parse(check);
        return parsed.tabId === tabId;
      }
      return true;
    } catch {
      return true;
    }
  };

  const release = (): void => {
    try {
      const existing = localStorage.getItem(LOCK_KEY);
      if (existing) {
        const parsed = JSON.parse(existing);
        if (parsed.tabId === tabId) {
          localStorage.removeItem(LOCK_KEY);
        }
      }
    } catch {}
  };

  while (!tryAcquire()) {
    if (Date.now() - startTime > MAX_WAIT_MS) {
      break;
    }
    const currentToken = getAccessToken();
    if (currentToken && initialAccessToken && currentToken !== initialAccessToken) {
      return currentToken;
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  try {
    return await action();
  } finally {
    release();
  }
}

export function refreshAccessToken(): Promise<string> {
  // If the current tab is already executing a refresh, queue onto the existing promise with strict timeout
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        failedQueue = failedQueue.filter((item) => item.resolve !== safeResolve);
        reject(new Error('Token refresh queue timed out'));
      }, REFRESH_TIMEOUT + 1000);

      const safeResolve = (token: string) => {
        clearTimeout(timeoutId);
        resolve(token);
      };

      const safeReject = (error: Error) => {
        clearTimeout(timeoutId);
        reject(error);
      };

      failedQueue.push({ resolve: safeResolve, reject: safeReject });
    });
  }

  const initialAccessToken = getAccessToken();
  const initialRefreshToken = getRefreshToken();

  if (!initialRefreshToken) {
    handleSessionExpired(initialAccessToken);
    return Promise.reject(new Error('No refresh token available'));
  }

  isRefreshing = true;

  const refreshPromise = (async () => {
    try {
      if (typeof navigator !== 'undefined' && 'locks' in navigator) {
        // Prevent indefinite hang on lock acquisition with AbortController
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const lockTimeout = controller ? setTimeout(() => controller.abort(), REFRESH_TIMEOUT) : null;
        try {
          const lockOptions = controller ? { signal: controller.signal } : undefined;
          interface LockManagerWithSignal {
            request(name: string, options: unknown, callback: () => Promise<string>): Promise<string>;
          }
          return await (navigator.locks as unknown as LockManagerWithSignal).request(REFRESH_LOCK_NAME, lockOptions, async () => {
            return await performRefresh(initialAccessToken, initialRefreshToken);
          });
        } finally {
          if (lockTimeout) clearTimeout(lockTimeout);
        }
      }
      // A-H4 Fallback: Web Locks unsupported (e.g. Safari < 15.4)
      return await requestFallbackLock(
        REFRESH_LOCK_NAME,
        initialAccessToken,
        async () => performRefresh(initialAccessToken, initialRefreshToken),
      );
    } catch (error) {
      // In case performRefresh threw outside or lock acquisition failed, ensure queue is drained
      const err = error instanceof Error ? error : new Error(String(error));
      processQueue(err, null);
      throw err;
    } finally {
      isRefreshing = false;
      // Drain any lingering queue requests so queue never hangs indefinitely
      if (failedQueue.length > 0) {
        processQueue(new Error('Token refresh aborted or timed out'), null);
      }
    }
  })();

  return refreshPromise;
}
