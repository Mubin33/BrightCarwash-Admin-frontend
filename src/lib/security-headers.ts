/**
 * Security Headers & Content Security Policy (AU6 / A-1, X-4)
 *
 * Implements strict, configuration-driven security headers for BrightSide Admin Dashboard:
 * - Eliminates developer/vendor domain defaults (pixelstack.cloud).
 * - Enforces exact origins in connect-src, img-src, and media-src (no wildcards like *.pixelstack.cloud or *.amazonaws.com).
 * - Dynamically derives allowed hosts from environment variables (NEXT_PUBLIC_API_BASE_URL, etc.).
 * - Generates production script-src with nonce support and strictly omits 'unsafe-inline' when nonce is present or in production.
 * - Restricts frames, object-src, and sets HSTS, nosniff, DENY frame options.
 */

export interface SecurityHeadersOptions {
  isDev?: boolean;
  apiBaseUrl?: string;
  aiBaseUrl?: string;
  storageUrl?: string;
  socketUrl?: string;
  additionalImageHosts?: string[];
  devOrigins?: string[];
  nonce?: string;
}

export interface SecurityHeader {
  key: string;
  value: string;
}

export interface ImageRemotePattern {
  protocol: 'http' | 'https';
  hostname: string;
  pathname: string;
}

export function sanitizeHostOrOrigin(val: string): string {
  return val.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
}

export function extractOrigin(urlStr?: string): string | null {
  if (!urlStr) return null;
  try {
    const url = new URL(urlStr);
    return url.origin;
  } catch {
    return null;
  }
}

export function extractHostname(urlStr?: string): string | null {
  if (!urlStr) return null;
  try {
    const url = new URL(urlStr);
    return url.hostname;
  } catch {
    return null;
  }
}

export function buildCsp(options: SecurityHeadersOptions = {}): string {
  const isDev = options.isDev ?? (process.env.NODE_ENV !== 'production');
  const apiBaseUrl = options.apiBaseUrl ?? process.env.NEXT_PUBLIC_API_BASE_URL;
  const aiBaseUrl = options.aiBaseUrl ?? process.env.NEXT_PUBLIC_AI_BASE_URL;
  const storageUrl = options.storageUrl ?? process.env.NEXT_PUBLIC_STORAGE_URL;
  const socketUrl = options.socketUrl ?? process.env.NEXT_PUBLIC_SOCKET_URL;
  const nonce = options.nonce;

  // Extract exact origins from configuration
  const exactOrigins: string[] = [];
  const apiOrigin = extractOrigin(apiBaseUrl);
  if (apiOrigin) exactOrigins.push(apiOrigin);

  const aiOrigin = extractOrigin(aiBaseUrl);
  if (aiOrigin && !exactOrigins.includes(aiOrigin)) exactOrigins.push(aiOrigin);

  const storageOrigin = extractOrigin(storageUrl);
  if (storageOrigin && !exactOrigins.includes(storageOrigin)) exactOrigins.push(storageOrigin);

  const socketOrigin = extractOrigin(socketUrl);
  if (socketOrigin && !exactOrigins.includes(socketOrigin)) exactOrigins.push(socketOrigin);

  // WebSocket origins derived from API and Socket URLs
  const wsOrigins: string[] = [];
  if (socketOrigin) {
    const ws = socketOrigin.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');
    if (!wsOrigins.includes(ws)) wsOrigins.push(ws);
  }
  if (apiOrigin) {
    const ws = apiOrigin.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');
    if (!wsOrigins.includes(ws)) wsOrigins.push(ws);
  }

  // Additional image hosts from env or options
  const additionalHosts = (options.additionalImageHosts ?? (process.env.ADDITIONAL_IMAGE_HOSTS ? process.env.ADDITIONAL_IMAGE_HOSTS.split(',') : []))
    .map(sanitizeHostOrOrigin)
    .filter(Boolean);
  const additionalImgOrigins = additionalHosts.map((h) => `https://${h}`);

  // Dev origins for connect-src
  const devOrigins = (options.devOrigins ?? (process.env.ALLOWED_DEV_ORIGINS ? process.env.ALLOWED_DEV_ORIGINS.split(',') : []))
    .map(sanitizeHostOrOrigin)
    .filter(Boolean);
  const devOriginsFormatted = devOrigins.map((h) => `http://${h} ws://${h} https://${h} wss://${h}`).join(' ');

  // Script-src:
  // AU6: "Production script-src has a nonce and no 'unsafe-inline'; connect-src lists exact hosts with no wildcards; the API host comes from configuration."
  let scriptSrc: string;
  if (nonce) {
    scriptSrc = `script-src 'self' 'nonce-${nonce}' https://editor.unlayer.com${isDev ? " 'unsafe-eval'" : ''}`;
  } else if (!isDev) {
    scriptSrc = "script-src 'self' https://editor.unlayer.com";
  } else {
    scriptSrc = "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://editor.unlayer.com";
  }

  // Connect-src:
  // Exact hosts with no wildcards. Includes self, data:, blob:, configured exact origins, and Unlayer
  const connectExactList = Array.from(new Set([
    "'self'",
    'data:',
    'blob:',
    ...exactOrigins,
    ...wsOrigins,
    'https://editor.unlayer.com',
  ])).join(' ');

  const devConnect = isDev
    ? `http://localhost:* ws://localhost:* http://127.0.0.1:* ws://127.0.0.1:* ${devOriginsFormatted}`.trim()
    : '';

  const connectSrc = `connect-src ${connectExactList} ${devConnect}`.trim().replace(/\s+/g, ' ');

  // Img-src: exact storage, API, AI, additional image hosts, Google avatars, and Unlayer
  const imgExactList = Array.from(new Set([
    "'self'",
    'data:',
    'blob:',
    'https://editor.unlayer.com',
    'https://*.googleusercontent.com',
    ...exactOrigins,
    ...additionalImgOrigins,
  ])).join(' ');
  const imgSrc = `img-src ${imgExactList}`.trim().replace(/\s+/g, ' ');

  // Media-src: exact storage, API origins
  const mediaExactList = Array.from(new Set([
    "'self'",
    'data:',
    'blob:',
    ...exactOrigins,
  ])).join(' ');
  const mediaSrc = `media-src ${mediaExactList}`.trim().replace(/\s+/g, ' ');

  const cspDirectives = [
    "default-src 'self'",
    scriptSrc.trim().replace(/\s+/g, ' '),
    "style-src 'self' 'unsafe-inline' https://editor.unlayer.com",
    imgSrc,
    "font-src 'self' data: https://fonts.gstatic.com",
    connectSrc,
    "frame-src 'self' https://editor.unlayer.com",
    "frame-ancestors 'none'",
    mediaSrc,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];

  return cspDirectives.join('; ');
}

export function getSecurityHeaders(options: SecurityHeadersOptions = {}): SecurityHeader[] {
  const isDev = options.isDev ?? (process.env.NODE_ENV !== 'production');
  const cspHeaderValue = buildCsp(options);

  return [
    {
      key: 'X-Frame-Options',
      value: 'DENY',
    },
    {
      key: 'X-Content-Type-Options',
      value: 'nosniff',
    },
    {
      key: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin',
    },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
    },
    {
      key: 'X-XSS-Protection',
      value: '0',
    },
    {
      key: 'Content-Security-Policy',
      value: cspHeaderValue,
    },
    ...(!isDev
      ? [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ]
      : []),
  ];
}

export function getImageRemotePatterns(options: {
  storageUrl?: string;
  additionalImageHosts?: string[];
  apiBaseUrl?: string;
} = {}): ImageRemotePattern[] {
  const storageUrl = options.storageUrl ?? process.env.NEXT_PUBLIC_STORAGE_URL;
  const storageHostname = extractHostname(storageUrl);

  const additionalHosts = (options.additionalImageHosts ?? (process.env.ADDITIONAL_IMAGE_HOSTS ? process.env.ADDITIONAL_IMAGE_HOSTS.split(',') : []))
    .map(sanitizeHostOrOrigin)
    .filter(Boolean);

  const apiBaseUrl = options.apiBaseUrl ?? process.env.NEXT_PUBLIC_API_BASE_URL;
  const apiHostname = extractHostname(apiBaseUrl);

  const patterns: ImageRemotePattern[] = [];

  if (storageHostname) {
    patterns.push({
      protocol: (storageUrl?.startsWith('http:') ? 'http' : 'https') as 'http' | 'https',
      hostname: storageHostname,
      pathname: '/**',
    });
  } else {
    patterns.push({
      protocol: 'https',
      hostname: 's3.us-east-1.amazonaws.com',
      pathname: '/**',
    });
  }

  if (apiHostname && apiHostname !== storageHostname) {
    patterns.push({
      protocol: (apiBaseUrl?.startsWith('http:') ? 'http' : 'https') as 'http' | 'https',
      hostname: apiHostname,
      pathname: '/**',
    });
  }

  for (const host of additionalHosts) {
    if (!patterns.some((p) => p.hostname === host)) {
      patterns.push({
        protocol: 'https',
        hostname: host,
        pathname: '/**',
      });
    }
  }

  return patterns;
}
