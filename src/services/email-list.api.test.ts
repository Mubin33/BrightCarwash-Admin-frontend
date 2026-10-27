import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiFetch } from '@/lib/api-fetch';
import { emailListApi } from './email-list.api';
import { configureStore } from '@reduxjs/toolkit';

vi.mock('@/lib/api-fetch', () => ({
  apiFetch: vi.fn(),
}));

describe('emailListApi (Issue #141 / A-17: Multiple CC/BCC addresses)', () => {
  let store: ReturnType<typeof createTestStore>;

  const createTestStore = () =>
    configureStore({
      reducer: {
        [emailListApi.reducerPath]: emailListApi.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(emailListApi.middleware),
    });

  beforeEach(() => {
    vi.clearAllMocks();
    store = createTestStore();
  });

  it('proves A-17: appends multiple CC addresses as separate array entries into FormData', async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'Email sent successfully' }),
    } as Response);

    const multipleCc = ['first.cc@example.com', 'second.cc@example.com', 'third.cc@example.com'];
    const multipleBcc = ['audit.bcc@example.com', 'management.bcc@example.com'];

    await store.dispatch(
      emailListApi.endpoints.sendEmail.initiate({
        to: 'recipient@example.com',
        cc: multipleCc,
        bcc: multipleBcc,
        subject: 'Weekly Report',
        body: '<p>Report details</p>',
      })
    );

    expect(apiFetch).toHaveBeenCalledTimes(1);
    const [url, options] = vi.mocked(apiFetch).mock.calls[0];
    expect(url).toBe('/admin/mail-management/send');
    expect(options?.method).toBe('POST');

    const formData = options?.body as FormData;
    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get('to')).toBe('recipient@example.com');
    expect(formData.get('subject')).toBe('Weekly Report');
    expect(formData.get('body')).toBe('<p>Report details</p>');

    // A-17 verification: CC addresses must be separate array items, not joined with comma
    const ccEntries = formData.getAll('cc');
    expect(ccEntries).toHaveLength(3);
    expect(ccEntries).toEqual(multipleCc);
    expect(formData.get('cc')).not.toContain(',');

    // A-17 verification: BCC addresses must be separate array items, not joined with comma
    const bccEntries = formData.getAll('bcc');
    expect(bccEntries).toHaveLength(2);
    expect(bccEntries).toEqual(multipleBcc);
    expect(formData.get('bcc')).not.toContain(',');
  });

  it('handles single CC and BCC addresses correctly', async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'Email sent successfully' }),
    } as Response);

    await store.dispatch(
      emailListApi.endpoints.sendEmail.initiate({
        to: 'lead@example.com',
        cc: ['single.cc@example.com'],
        bcc: ['single.bcc@example.com'],
        subject: 'Invoice',
        body: '<p>Invoice attached</p>',
      })
    );

    const [, options] = vi.mocked(apiFetch).mock.calls[0];
    const formData = options?.body as FormData;

    expect(formData.getAll('cc')).toEqual(['single.cc@example.com']);
    expect(formData.getAll('bcc')).toEqual(['single.bcc@example.com']);
  });

  it('omits CC and BCC when not provided', async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'Email sent successfully' }),
    } as Response);

    await store.dispatch(
      emailListApi.endpoints.sendEmail.initiate({
        to: 'customer@example.com',
        subject: 'Welcome',
        body: '<p>Welcome!</p>',
      })
    );

    const [, options] = vi.mocked(apiFetch).mock.calls[0];
    const formData = options?.body as FormData;

    expect(formData.getAll('cc')).toEqual([]);
    expect(formData.getAll('bcc')).toEqual([]);
  });

  it('getEmailLogs queries /admin/mail-management/logs with parameters', async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        message: 'OK',
        data: {
          data: [],
          meta: { totalItems: 0, itemCount: 0, itemsPerPage: 10, totalPages: 0, currentPage: 1 },
        },
      }),
    } as Response);

    const result = await store.dispatch(
      emailListApi.endpoints.getEmailLogs.initiate({
        page: 2,
        limit: 15,
        search: 'quote',
      })
    );

    expect(apiFetch).toHaveBeenCalledWith(
      '/admin/mail-management/logs?page=2&limit=15&search=quote'
    );
    expect(result.data?.success).toBe(true);
  });

  it('deleteEmailLog sends DELETE to /admin/mail-management/logs/:id', async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'Log deleted' }),
    } as Response);

    const result = await store.dispatch(
      emailListApi.endpoints.deleteEmailLog.initiate('log-123')
    );

    expect(apiFetch).toHaveBeenCalledWith(
      '/admin/mail-management/logs/log-123',
      { method: 'DELETE' }
    );
    expect(result.data?.success).toBe(true);
  });
});
