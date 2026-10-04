import { APP_CONFIG } from '@/configs/app.config';
import { getAccessToken } from '@/lib/auth-client';
import { refreshAccessToken } from '@/lib/token-refresh';

export const DEFAULT_FETCH_TIMEOUT = 30000; // 30 seconds default
export const UPLOAD_FETCH_TIMEOUT = 120000; // 2 minutes for file uploads

export interface ApiFetchOptions extends RequestInit {
  timeout?: number;
}

/**
 * Determines whether the Authorization header should be attached to the target URL.
 * Only forwards credentials to internal API/AI endpoints and trusted organization origins (*.pixelstack.cloud).
 * Never forwards admin Bearer tokens to external third-party origins, S3 buckets, or arbitrary hosts.
 */
export function isTrustedInternalOrigin(urlStr: string): boolean {
  if (!urlStr) return false;
  if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
    return true; // Relative URLs resolve to APP_CONFIG.API_BASE_URL
  }

  try {
    const targetUrl = new URL(urlStr);
    const targetHost = targetUrl.hostname.toLowerCase();

    // Check against configured API base URL
    if (APP_CONFIG.API_BASE_URL) {
      try {
        const apiHost = new URL(APP_CONFIG.API_BASE_URL).hostname.toLowerCase();
        if (targetHost === apiHost || targetHost.endsWith(`.${apiHost}`)) {
          return true;
        }
      } catch {
        // Ignore invalid configured URL
      }
    }

    // Check against configured AI base URL
    if (APP_CONFIG.AI_BASE_URL) {
      try {
        const aiHost = new URL(APP_CONFIG.AI_BASE_URL).hostname.toLowerCase();
        if (targetHost === aiHost || targetHost.endsWith(`.${aiHost}`)) {
          return true;
        }
      } catch {
        // Ignore invalid configured URL
      }
    }

    // Allow *.pixelstack.cloud domains for all trusted organizational microservices
    if (targetHost === 'pixelstack.cloud' || targetHost.endsWith('.pixelstack.cloud')) {
      return true;
    }

    // Allow localhost/127.0.0.1 in non-production environments
    if (
      process.env.NODE_ENV !== 'production' &&
      (targetHost === 'localhost' || targetHost === '127.0.0.1')
    ) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Creates an AbortSignal that aborts after timeoutMs or when userSignal aborts,
 * and provides a cleanup function to prevent timer/listener leaks.
 */
function createCompositeTimeoutSignal(
  timeoutMs: number,
  userSignal?: AbortSignal | null,
): { signal: AbortSignal; cleanup: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort(
      new DOMException(
        'Request timed out. Please check your internet connection and try again.',
        'TimeoutError',
      ),
    );
  }, timeoutMs);

  let removeUserListener: (() => void) | undefined;
  if (userSignal) {
    if (userSignal.aborted) {
      controller.abort(userSignal.reason);
    } else {
      const onUserAbort = () => controller.abort(userSignal.reason);
      userSignal.addEventListener('abort', onUserAbort, { once: true });
      removeUserListener = () => {
        userSignal.removeEventListener('abort', onUserAbort);
      };
    }
  }

  const cleanup = () => {
    clearTimeout(timer);
    if (removeUserListener) {
      removeUserListener();
    }
  };

  return { signal: controller.signal, cleanup };
}

export async function apiFetch(
  input: string | URL | Request,
  init?: ApiFetchOptions,
): Promise<Response> {
  const rawUrl = typeof input === 'string' ? input : input.toString();
  const fullUrl =
    rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
      ? rawUrl
      : `${APP_CONFIG.API_BASE_URL}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;

  const headers = new Headers(init?.headers);
  const token = getAccessToken();
  if (token && !headers.has('Authorization') && isTrustedInternalOrigin(fullUrl)) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const isFormData = init?.body instanceof FormData;
  if (isFormData) {
    headers.delete('Content-Type');
  } else if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const timeoutMs =
    init?.timeout !== undefined
      ? init.timeout
      : isFormData
        ? UPLOAD_FETCH_TIMEOUT
        : DEFAULT_FETCH_TIMEOUT;

  const { signal, cleanup } = createCompositeTimeoutSignal(
    timeoutMs,
    init?.signal,
  );

  let response: Response;
  try {
    response = await fetch(fullUrl, {
      ...init,
      headers,
      signal,
    });
  } finally {
    cleanup();
  }

  const isAuthRoute =
    fullUrl.includes('/auth/login') ||
    fullUrl.includes('/auth/refresh-tokens') ||
    fullUrl.includes('/auth/logout');

  if (response.status === 401 && !isAuthRoute && isTrustedInternalOrigin(fullUrl)) {
    try {
      const newAccessToken = await refreshAccessToken();
      headers.set('Authorization', `Bearer ${newAccessToken}`);

      const retrySignalHelper = createCompositeTimeoutSignal(
        timeoutMs,
        init?.signal,
      );
      try {
        response = await fetch(fullUrl, {
          ...init,
          headers,
          signal: retrySignalHelper.signal,
        });
      } finally {
        retrySignalHelper.cleanup();
      }
    } catch {
      // Token refresh failure is handled by refreshAccessToken redirecting to /login
    }
  }

  return response;
}

export async function fetchFromBackend<T>(
  url: string,
  options?: ApiFetchOptions,
): Promise<T> {
  const res = await apiFetch(url, options);
  if (!res.ok) {
    let errorMsg = `Request failed: ${res.status}`;
    try {
      const errorData = await res.json();
      if (errorData?.message) {
        errorMsg = Array.isArray(errorData.message)
          ? errorData.message.join(', ')
          : errorData.message;
      }
    } catch {
      // Response was not JSON
    }
    throw new Error(errorMsg);
  }

  const text = await res.text();
  if (!text) {
    return null as unknown as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error('Failed to parse JSON response');
  }
}
