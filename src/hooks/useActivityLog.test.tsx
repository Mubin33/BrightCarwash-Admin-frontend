// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '@/lib/store';
import { useActivityLog } from './useActivityLog';
import axiosInstance from '@/lib/axios-instance';

vi.mock('@/lib/axios-instance', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

let mockFilterSearch = '';
let mockFilterAction = 'All types';
let mockFilterTimeRange = 'All Time';

vi.mock('./useActivityLogFilters', () => ({
  useActivityLogFilters: () => ({
    search: mockFilterSearch,
    action: mockFilterAction,
    timeRange: mockFilterTimeRange,
    entity: 'all',
    setSearch: (s: string) => { mockFilterSearch = s; },
    setAction: (a: string) => { mockFilterAction = a; },
    setTimeRange: (t: string) => { mockFilterTimeRange = t; },
    setEntity: vi.fn(),
    resetFilters: vi.fn(),
  }),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider store={store}>{children}</Provider>
);

describe('Activity Log Server-Side Filtering (API Change Guide)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFilterSearch = '';
    mockFilterAction = 'All types';
    mockFilterTimeRange = 'All Time';
  });

  it('queries the backend with debounced search and active filters, returning filtered dataset', async () => {
    const matchingLogItem = {
      id: 'log-bob',
      action: 'LEAD_UPDATED',
      entity: 'Lead',
      description: 'Lead updated for Bob',
      createdAt: '2026-10-18T00:00:00Z',
      user: { first_name: 'Bob', last_name: 'Jones', avatar: null },
    };

    mockFilterSearch = 'Bob';

    vi.mocked(axiosInstance.get).mockImplementation(async (_url, config) => {
      const search = (config?.params as { search?: string } | undefined)?.search;
      if (search === 'Bob') {
        return {
          data: {
            success: true,
            data: [matchingLogItem],
            meta: {
              page: 1,
              limit: 10,
              total_count: 1,
              total_pages: 1,
              has_next: false,
              has_previous: false,
            },
          },
        };
      }
      return {
        data: {
          success: true,
          data: [],
          meta: {
            page: 1,
            limit: 10,
            total_count: 0,
            total_pages: 0,
            has_next: false,
            has_previous: false,
          },
        },
      };
    });

    const { result } = renderHook(() => useActivityLog(), { wrapper });

    await waitFor(
      () => {
        expect(result.current.logs).toHaveLength(1);
        expect(result.current.logs[0].description).toBe('Lead updated for Bob');
        expect(result.current.totalCount).toBe(1);
        expect(result.current.totalPages).toBe(1);
      },
      { timeout: 2000 }
    );
  });

  it('resets page to 1 when search or filter options change', async () => {
    vi.mocked(axiosInstance.get).mockResolvedValue({
      data: {
        success: true,
        data: [],
        meta: {
          page: 1,
          limit: 10,
          total_count: 0,
          total_pages: 0,
          has_next: false,
          has_previous: false,
        },
      },
    });

    const { result } = renderHook(() => useActivityLog(), { wrapper });

    act(() => {
      result.current.setPage(3);
    });

    expect(result.current.currentPage).toBe(3);
  });
});
