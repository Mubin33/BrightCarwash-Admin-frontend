import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { isTrustedInternalOrigin } from './api-fetch';

describe('isTrustedInternalOrigin security safeguard (AUTH-015)', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('trusts relative API endpoints', () => {
    expect(isTrustedInternalOrigin('/admin/quotes')).toBe(true);
    expect(isTrustedInternalOrigin('/api/v1/leads')).toBe(true);
    expect(isTrustedInternalOrigin('admin/leads')).toBe(true);
  });

  it('trusts configured API and AI internal services', () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.brightsidecarwash.com/api';
    process.env.NEXT_PUBLIC_AI_BASE_URL = 'https://ai.brightsidecarwash.com/api/v1';

    expect(isTrustedInternalOrigin('https://api.brightsidecarwash.com/api')).toBe(true);
    expect(isTrustedInternalOrigin('https://ai.brightsidecarwash.com/api/v1')).toBe(true);
  });

  it('rejects untrusted sibling pixelstack.cloud domains outside product scope (AUTH-015)', () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.brightsidecarwash.com/api';

    expect(isTrustedInternalOrigin('https://other.pixelstack.cloud/x')).toBe(false);
    expect(isTrustedInternalOrigin('https://pixelstack.cloud/test')).toBe(false);
    expect(isTrustedInternalOrigin('https://attacker.pixelstack.cloud/api')).toBe(false);
  });

  it('rejects external Amazon S3 buckets (preventing token exfiltration)', () => {
    expect(isTrustedInternalOrigin('https://s3.amazonaws.com/bright-side-car-wash')).toBe(false);
    expect(isTrustedInternalOrigin('https://bright-side-car-wash.s3.us-east-1.amazonaws.com/file.pdf')).toBe(false);
  });

  it('rejects malicious external third-party origins', () => {
    expect(isTrustedInternalOrigin('https://attacker.com/api')).toBe(false);
    expect(isTrustedInternalOrigin('https://fake-pixelstack.cloud.evil.com')).toBe(false);
    expect(isTrustedInternalOrigin('https://untrusted-domain.org')).toBe(false);
  });

  it('handles empty or malformed input safely without throwing', () => {
    expect(isTrustedInternalOrigin('')).toBe(false);
    expect(isTrustedInternalOrigin('not-a-valid-url:::')).toBe(true); // Treated as relative path
  });
});
