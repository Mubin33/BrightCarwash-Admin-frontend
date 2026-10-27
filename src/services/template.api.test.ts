import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiFetch } from '@/lib/api-fetch';
import axiosInstance from '@/lib/axios-instance';
import { templateApi } from './template.api';
import { configureStore } from '@reduxjs/toolkit';

vi.mock('@/lib/api-fetch', () => ({
  apiFetch: vi.fn(),
}));

vi.mock('@/lib/axios-instance', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('templateApi (Issue #140 / A-16: Template image upload field and response path)', () => {
  let store: ReturnType<typeof createTestStore>;

  const createTestStore = () =>
    configureStore({
      reducer: {
        [templateApi.reducerPath]: templateApi.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(templateApi.middleware),
    });

  beforeEach(() => {
    vi.clearAllMocks();
    store = createTestStore();
  });

  it('proves A-16: sends file in field "file" and extracts url from backend response { data: { url } }', async () => {
    const mockFile = new File(['dummy-image-content'], 'test-banner.png', { type: 'image/png' });
    const expectedCdnUrl = 'https://cdn.example.com/templates/test-banner.png';

    vi.mocked(apiFetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          url: expectedCdnUrl,
        },
      }),
    } as Response);

    const result = await store.dispatch(
      templateApi.endpoints.uploadTemplateImage.initiate(mockFile)
    );

    expect(apiFetch).toHaveBeenCalledTimes(1);
    const [url, options] = vi.mocked(apiFetch).mock.calls[0];
    expect(url).toBe('/admin/templates/upload-image');
    expect(options?.method).toBe('POST');

    const formData = options?.body as FormData;
    expect(formData).toBeInstanceOf(FormData);

    // A-16 verification: Field must be 'file', NOT 'image'
    expect(formData.get('file')).toBeTruthy();
    expect(formData.get('image')).toBeNull();

    // A-16 verification: Result must correctly extract { url } from data.url
    expect(result).toHaveProperty('data');
    expect(result.data).toEqual({ url: expectedCdnUrl });
  });

  it('handles fallback string data or top-level url response correctly', async () => {
    const mockFile = new File(['dummy'], 'logo.jpg', { type: 'image/jpeg' });
    const fallbackUrl = 'https://cdn.example.com/templates/logo.jpg';

    vi.mocked(apiFetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: fallbackUrl,
      }),
    } as Response);

    const result = await store.dispatch(
      templateApi.endpoints.uploadTemplateImage.initiate(mockFile)
    );

    expect(result.data).toEqual({ url: fallbackUrl });
  });

  it('handles upload failure gracefully with error status and message', async () => {
    const mockFile = new File(['dummy'], 'broken.png', { type: 'image/png' });

    vi.mocked(apiFetch).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        success: false,
        message: 'File size exceeds 10MB limit',
      }),
    } as Response);

    const result = await store.dispatch(
      templateApi.endpoints.uploadTemplateImage.initiate(mockFile)
    );

    expect(result).toHaveProperty('error');
    expect(result.error).toEqual({
      status: 400,
      data: 'File size exceeds 10MB limit',
    });
  });

  it('archiveTemplate patches /admin/templates/:id/archive', async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    } as Response);

    const result = await store.dispatch(
      templateApi.endpoints.archiveTemplate.initiate('template-123')
    );

    expect(apiFetch).toHaveBeenCalledWith('/admin/templates/template-123/archive', {
      method: 'PATCH',
    });
    expect(result.data).toEqual({ success: true });
  });
});
