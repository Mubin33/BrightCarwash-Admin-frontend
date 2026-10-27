import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  buildCsp,
  getSecurityHeaders,
  getImageRemotePatterns,
  extractOrigin,
  extractHostname,
  sanitizeHostOrOrigin,
} from './security-headers';

describe('AU6 (P0) — Security Headers & CSP (A-1, X-4)', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    delete process.env.NEXT_PUBLIC_AI_BASE_URL;
    delete process.env.NEXT_PUBLIC_STORAGE_URL;
    delete process.env.NEXT_PUBLIC_SOCKET_URL;
    delete process.env.ADDITIONAL_IMAGE_HOSTS;
    delete process.env.ALLOWED_DEV_ORIGINS;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('AU6 / X-4: connect-src lists exact hosts with no wildcards', () => {
    it('proves X-4: connect-src contains exact configured hosts and forbids wildcard vendor domains (*.pixelstack.cloud, *.amazonaws.com)', () => {
      const csp = buildCsp({
        isDev: false,
        apiBaseUrl: 'https://api.brightsidecarwash.com/api',
        aiBaseUrl: 'https://ai.brightsidecarwash.com/api/v1',
        storageUrl: 'https://s3.us-east-1.amazonaws.com/brightside-storage',
        socketUrl: 'https://socket.brightsidecarwash.com',
      });

      // Must NOT contain wildcard vendor domains
      expect(csp).not.toContain('*.pixelstack.cloud');
      expect(csp).not.toContain('*.amazonaws.com');
      expect(csp).not.toContain('wss://*.pixelstack.cloud');
      expect(csp).not.toContain('ws://*.pixelstack.cloud');

      // Must contain exact origins derived from configuration
      expect(csp).toContain('https://api.brightsidecarwash.com');
      expect(csp).toContain('https://ai.brightsidecarwash.com');
      expect(csp).toContain('https://s3.us-east-1.amazonaws.com');
      expect(csp).toContain('https://socket.brightsidecarwash.com');
      expect(csp).toContain('wss://api.brightsidecarwash.com');
      expect(csp).toContain('wss://socket.brightsidecarwash.com');
    });

    it('proves X-4: does not inject developer vendor domain pixelstack.cloud when not configured in env', () => {
      const csp = buildCsp({
        isDev: false,
        apiBaseUrl: 'https://custom-api.brightside.com/api',
      });

      expect(csp).not.toContain('pixelstack.cloud');
      expect(csp).toContain('https://custom-api.brightside.com');
    });

    it('derives exact hosts from environment variables when options are omitted', () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = 'https://env-api.brightside.com/api';
      process.env.NEXT_PUBLIC_AI_BASE_URL = 'https://env-ai.brightside.com/api/v1';
      process.env.NEXT_PUBLIC_STORAGE_URL = 'https://env-cdn.brightside.com/media';
      process.env.NEXT_PUBLIC_SOCKET_URL = 'https://env-socket.brightside.com';

      const csp = buildCsp({ isDev: false });

      expect(csp).toContain('https://env-api.brightside.com');
      expect(csp).toContain('https://env-ai.brightside.com');
      expect(csp).toContain('https://env-cdn.brightside.com');
      expect(csp).toContain('https://env-socket.brightside.com');
      expect(csp).not.toContain('*.pixelstack.cloud');
      expect(csp).not.toContain('*.amazonaws.com');
    });
  });

  describe('AU6 / A-1: Production script-src has a nonce and no unsafe-inline', () => {
    it('proves A-1: production build with nonce enforces nonce and strictly omits unsafe-inline and unsafe-eval', () => {
      const testNonce = 'abc123nonce456';
      const csp = buildCsp({
        isDev: false,
        nonce: testNonce,
      });

      // Must have nonce
      expect(csp).toContain(`script-src 'self' 'nonce-${testNonce}' https://editor.unlayer.com`);

      // Must NOT contain unsafe-inline or unsafe-eval in production script-src
      const scriptSrcDirective = csp
        .split(';')
        .map((s) => s.trim())
        .find((s) => s.startsWith('script-src'));

      expect(scriptSrcDirective).toBeDefined();
      expect(scriptSrcDirective).not.toContain("'unsafe-inline'");
      expect(scriptSrcDirective).not.toContain("'unsafe-eval'");
    });

    it('production build without specific nonce permits unsafe-inline and unsafe-eval for Next.js client hydration', () => {
      const csp = buildCsp({ isDev: false });

      const scriptSrcDirective = csp
        .split(';')
        .map((s) => s.trim())
        .find((s) => s.startsWith('script-src'));

      expect(scriptSrcDirective).toContain("'unsafe-inline'");
      expect(scriptSrcDirective).toContain("'unsafe-eval'");
    });
  });

  describe('AU6: Development build allowances', () => {
    it('permits unsafe-inline and unsafe-eval in development mode for HMR and sourcemaps', () => {
      const csp = buildCsp({ isDev: true });

      const scriptSrcDirective = csp
        .split(';')
        .map((s) => s.trim())
        .find((s) => s.startsWith('script-src'));

      expect(scriptSrcDirective).toContain("'unsafe-inline'");
      expect(scriptSrcDirective).toContain("'unsafe-eval'");
    });

    it('permits localhost and 127.0.0.1 in connect-src in development', () => {
      const csp = buildCsp({ isDev: true });

      expect(csp).toContain('http://localhost:*');
      expect(csp).toContain('ws://localhost:*');
      expect(csp).toContain('http://127.0.0.1:*');
      expect(csp).toContain('ws://127.0.0.1:*');
    });

    it('supports custom dev origins for local network testing', () => {
      const csp = buildCsp({
        isDev: true,
        devOrigins: ['192.168.1.100:3000', 'my-tunnel.trycloudflare.com'],
      });

      expect(csp).toContain('http://192.168.1.100:3000');
      expect(csp).toContain('https://my-tunnel.trycloudflare.com');
    });
  });

  describe('getSecurityHeaders full suite', () => {
    it('returns all mandated HTTP security headers in production', () => {
      const headers = getSecurityHeaders({
        isDev: false,
        apiBaseUrl: 'https://api.brightside.com/api',
      });

      const headerMap = Object.fromEntries(headers.map((h) => [h.key, h.value]));

      expect(headerMap['X-Frame-Options']).toBe('DENY');
      expect(headerMap['X-Content-Type-Options']).toBe('nosniff');
      expect(headerMap['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
      expect(headerMap['Permissions-Policy']).toContain('camera=()');
      expect(headerMap['X-XSS-Protection']).toBe('0');
      expect(headerMap['Content-Security-Policy']).toBeDefined();
      expect(headerMap['Strict-Transport-Security']).toBe('max-age=63072000; includeSubDomains; preload');
    });

    it('omits Strict-Transport-Security in development to prevent localhost caching issues', () => {
      const headers = getSecurityHeaders({ isDev: true });
      const headerMap = Object.fromEntries(headers.map((h) => [h.key, h.value]));

      expect(headerMap['Strict-Transport-Security']).toBeUndefined();
    });
  });

  describe('getImageRemotePatterns', () => {
    it('proves X-4: returns exact remote patterns without wildcard vendor domains', () => {
      const patterns = getImageRemotePatterns({
        storageUrl: 'https://s3.us-east-1.amazonaws.com/bucket-name',
        apiBaseUrl: 'https://api.brightsidecarwash.com/api',
        additionalImageHosts: ['cdn.brightside.com'],
      });

      const hostnames = patterns.map((p) => p.hostname);
      expect(hostnames).not.toContain('*.pixelstack.cloud');
      expect(hostnames).not.toContain('*.amazonaws.com');

      expect(hostnames).toContain('s3.us-east-1.amazonaws.com');
      expect(hostnames).toContain('api.brightsidecarwash.com');
      expect(hostnames).toContain('cdn.brightside.com');
    });
  });

  describe('Utility functions', () => {
    it('extractOrigin extracts origin safely or returns null', () => {
      expect(extractOrigin('https://api.example.com/sub/path')).toBe('https://api.example.com');
      expect(extractOrigin('invalid-url')).toBeNull();
      expect(extractOrigin(undefined)).toBeNull();
    });

    it('extractHostname extracts hostname safely or returns null', () => {
      expect(extractHostname('https://api.example.com:8080/path')).toBe('api.example.com');
      expect(extractHostname('invalid-url')).toBeNull();
      expect(extractHostname(undefined)).toBeNull();
    });

    it('sanitizeHostOrOrigin cleans protocols and trailing slashes', () => {
      expect(sanitizeHostOrOrigin('https://api.example.com/path')).toBe('api.example.com');
      expect(sanitizeHostOrOrigin('http://cdn.example.com/')).toBe('cdn.example.com');
      expect(sanitizeHostOrOrigin('example.com')).toBe('example.com');
    });
  });
});
