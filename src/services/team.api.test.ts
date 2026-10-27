import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosInstance from '@/lib/axios-instance';
import { teamApi } from './team.api';
import { configureStore } from '@reduxjs/toolkit';

vi.mock('@/lib/axios-instance', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('teamApi (Issue #139 / A-15: Teams page limit <= 100 and pagination)', () => {
  let store: ReturnType<typeof createTestStore>;

  const createTestStore = () =>
    configureStore({
      reducer: {
        [teamApi.reducerPath]: teamApi.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(teamApi.middleware),
    });

  beforeEach(() => {
    vi.clearAllMocks();
    store = createTestStore();
  });

  it('proves A-15: getTeamMembers requests /admin/members with limit=100 adhering to server maximum', async () => {
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({
      data: {
        success: true,
        message: 'OK',
        data: [
          {
            id: 'mem-1',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
            roleUsers: [{ role: { id: 'role-1', name: 'Technician' } }],
            status: 1,
            created_at: '2026-10-01T00:00:00Z',
          },
        ],
        meta: {
          totalItems: 1,
          itemCount: 1,
          itemsPerPage: 100,
          totalPages: 1,
          currentPage: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
    });

    const result = await store.dispatch(
      teamApi.endpoints.getTeamMembers.initiate({ page: 1, limit: 100 })
    );

    expect(axiosInstance.get).toHaveBeenCalledWith('/admin/members?page=1&limit=100');
    expect(result.data?.members).toHaveLength(1);
    expect(result.data?.members[0]).toMatchObject({
      id: 'mem-1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Technician',
      status: 1,
    });
    expect(result.data?.meta.totalPages).toBe(1);
  });

  it('proves A-15: allows paging through members with limit=100 across multiple pages', async () => {
    // Page 1
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({
      data: {
        success: true,
        data: [
          {
            id: 'mem-1',
            first_name: 'Member',
            last_name: 'One',
            email: 'mem1@example.com',
            roleUsers: [{ role: { id: 'role-1', name: 'Technician' } }],
            isActive: true,
          },
        ],
        meta: {
          totalItems: 150,
          itemCount: 100,
          itemsPerPage: 100,
          totalPages: 2,
          currentPage: 1,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      },
    });

    // Page 2
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({
      data: {
        success: true,
        data: [
          {
            id: 'mem-2',
            first_name: 'Member',
            last_name: 'Two',
            email: 'mem2@example.com',
            roleUsers: [{ role: { id: 'role-2', name: 'Manager' } }],
            isActive: true,
          },
        ],
        meta: {
          totalItems: 150,
          itemCount: 50,
          itemsPerPage: 100,
          totalPages: 2,
          currentPage: 2,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      },
    });

    const page1Result = await store.dispatch(
      teamApi.endpoints.getTeamMembers.initiate({ page: 1, limit: 100 })
    );
    expect(axiosInstance.get).toHaveBeenCalledWith('/admin/members?page=1&limit=100');
    expect(page1Result.data?.meta.totalPages).toBe(2);

    const page2Result = await store.dispatch(
      teamApi.endpoints.getTeamMembers.initiate({ page: 2, limit: 100 })
    );
    expect(axiosInstance.get).toHaveBeenCalledWith('/admin/members?page=2&limit=100');

    const allMembers = [
      ...(page1Result.data?.members || []),
      ...(page2Result.data?.members || []),
    ];
    expect(allMembers).toHaveLength(2);
    expect(allMembers.map((m) => m.role)).toEqual(['Technician', 'Manager']);
  });

  it('proves A-15: getTeamMembers correctly includes search query parameter alongside limit=100', async () => {
    vi.mocked(axiosInstance.get).mockResolvedValueOnce({
      data: {
        data: [],
        meta: {
          totalItems: 0,
          itemCount: 0,
          itemsPerPage: 100,
          totalPages: 1,
          currentPage: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
    });

    await store.dispatch(
      teamApi.endpoints.getTeamMembers.initiate({
        page: 1,
        limit: 100,
        search: 'Alice',
      })
    );

    expect(axiosInstance.get).toHaveBeenCalledWith('/admin/members?search=Alice&page=1&limit=100');
  });

  it('proves A-15: handles network errors gracefully without crashing', async () => {
    vi.mocked(axiosInstance.get).mockRejectedValueOnce(new Error('Network error'));

    const result = await store.dispatch(
      teamApi.endpoints.getTeamMembers.initiate({ page: 1, limit: 100 })
    );

    expect(result.error).toEqual({
      status: 500,
      data: 'Network error',
    });
  });
});
