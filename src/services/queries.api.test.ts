import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosInstance from '@/lib/axios-instance';
import { queriesApi } from './queries.api';
import { configureStore } from '@reduxjs/toolkit';

vi.mock('@/lib/axios-instance', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    post: vi.fn(),
  },
}));

describe('queriesApi (Issue #142 / A-18)', () => {
  let store: ReturnType<typeof createTestStore>;

  const createTestStore = () =>
    configureStore({
      reducer: {
        [queriesApi.reducerPath]: queriesApi.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(queriesApi.middleware),
    });

  beforeEach(() => {
    vi.clearAllMocks();
    store = createTestStore();
  });

  it('proves A-18: sendEmail dead endpoint is removed from endpoints and hooks', () => {
    // AU12 / A-18 requirement: Dead route /admin/quotes/:id/send-email is removed
    const endpoints = queriesApi.endpoints as Record<string, unknown>;
    expect(endpoints.sendEmail).toBeUndefined();
    expect((queriesApi as Record<string, unknown>).useSendEmailMutation).toBeUndefined();
  });

  it('getQuotes queries /admin/quotes with stripped plus prefix and pagination params', async () => {
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({
      data: {
        success: true,
        message: 'OK',
        data: {
          items: [],
          meta: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        },
      },
    });

    const result = await store.dispatch(
      queriesApi.endpoints.getQuotes.initiate({
        page: 2,
        limit: 20,
        status: 'new',
        search: '+1234567890',
      })
    );

    expect(axiosInstance.get).toHaveBeenCalledWith('/admin/quotes', {
      params: {
        page: 2,
        limit: 20,
        status: 'new',
        search: '1234567890',
      },
    });
    expect(result.data?.success).toBe(true);
  });

  it('updateStatus patches /admin/quotes/:id with status payload', async () => {
    vi.mocked(axiosInstance.patch).mockResolvedValueOnce({
      data: { success: true, message: 'Status updated' },
    });

    const result = await store.dispatch(
      queriesApi.endpoints.updateStatus.initiate({
        id: 'quote-123',
        status: 'replied',
      })
    );

    expect(axiosInstance.patch).toHaveBeenCalledWith('/admin/quotes/quote-123', {
      status: 'replied',
    });
    expect(result).toHaveProperty('data');
  });

  it('deleteQuote deletes /admin/quotes/:id', async () => {
    vi.mocked(axiosInstance.delete).mockResolvedValueOnce({
      data: { success: true, message: 'Quote deleted' },
    });

    const result = await store.dispatch(
      queriesApi.endpoints.deleteQuote.initiate({
        id: 'quote-456',
      })
    );

    expect(axiosInstance.delete).toHaveBeenCalledWith('/admin/quotes/quote-456');
    expect(result).toHaveProperty('data');
  });

  it('queriesDetail fetches /admin/quotes/:id', async () => {
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({
      data: {
        success: true,
        message: 'OK',
        data: {
          id: 'quote-789',
          full_name: 'Test Customer',
          email: 'test@example.com',
          phone: '1234567890',
          vehicle: 'Sedan',
          status: 'new',
          description: null,
          date: '2026-10-17T00:00:00.000Z',
          created_at: '2026-10-17T00:00:00.000Z',
          updated_at: '2026-10-17T00:00:00.000Z',
        },
      },
    });

    const result = await store.dispatch(
      queriesApi.endpoints.queriesDetail.initiate({
        id: 'quote-789',
      })
    );

    expect(axiosInstance.get).toHaveBeenCalledWith('/admin/quotes/quote-789');
    expect(result.data?.data.id).toBe('quote-789');
  });
});
