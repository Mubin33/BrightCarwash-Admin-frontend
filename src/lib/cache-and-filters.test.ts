import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosInstance from '@/lib/axios-instance';
import { apiFetch } from '@/lib/api-fetch';
import { store } from '@/lib/store';
import { dashboardApi } from '@/services/dashboard.api';
import { reportsApi } from '@/services/reports.api';
import { activityLogApi } from '@/services/activity-log.api';
import { teamApi } from '@/services/team.api';

vi.mock('@/lib/axios-instance', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@/lib/api-fetch', () => ({
  apiFetch: vi.fn(),
  fetchFromBackend: vi.fn(),
}));

describe('AU11 / A-13 & A-14: Cross-Feature Cache Invalidation and Server-Side Filters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Part 1: Activity Log Server-Side Filters (Proves A-13)', () => {
    it('proves A-13: activity log filters are sent to the server so entries on page 3 are found', async () => {
      // Mock server response for an entry found on page 3 that matches the filter
      const mockLogItem = {
        id: 'log-p3-entry',
        action: 'LEAD_CREATED',
        entity: 'Lead',
        description: 'New high priority lead created for John',
        createdAt: '2026-10-18T00:00:00Z',
        user: { name: 'Admin User', email: 'admin@brightside.com' },
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: [mockLogItem],
          meta: {
            total_count: 1,
            total_pages: 1,
            current_page: 1,
            has_next: false,
            has_previous: false,
          },
        },
      });

      // Query with search and action filters
      const result = await store.dispatch(
        activityLogApi.endpoints.getActivityLogs.initiate({
          page: 1,
          limit: 10,
          search: 'John',
          action: 'LEAD_CREATED',
          timeRange: 'Last 7 Days',
        })
      );

      // Verify that filters were sent as server query parameters
      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/admin/activity-log',
        expect.objectContaining({
          params: expect.objectContaining({
            page: 1,
            limit: 10,
            search: 'John',
            action: 'LEAD_CREATED',
            timeRange: 'Last 7 Days',
          }),
        })
      );

      expect(result.data?.data).toHaveLength(1);
      expect(result.data?.data[0].id).toBe('log-p3-entry');
      expect(result.data?.data[0].description).toContain('John');
    });

    it('proves A-13: filters omit empty search or default all options', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: [],
          meta: {
            total_count: 0,
            total_pages: 1,
            current_page: 1,
            has_next: false,
            has_previous: false,
          },
        },
      });

      await store.dispatch(
        activityLogApi.endpoints.getActivityLogs.initiate({
          page: 2,
          limit: 10,
          action: 'All types',
          timeRange: 'All Time',
        })
      );

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/admin/activity-log',
        {
          params: {
            page: 2,
            limit: 10,
          },
        }
      );
    });
  });

  describe('Part 2: Lead Mutation Cross-Feature Cache Invalidation (Proves A-14)', () => {
    it('proves A-14: a lead mutation invalidates dashboard metrics, report and activity log caches', async () => {
      // Spy on cache invalidations
      const dashboardInvalidateSpy = vi.spyOn(dashboardApi.util, 'invalidateTags');
      const reportsInvalidateSpy = vi.spyOn(reportsApi.util, 'invalidateTags');
      const activityLogInvalidateSpy = vi.spyOn(activityLogApi.util, 'invalidateTags');

      // Dispatch a lead mutation fulfilled action simulating a lead update
      store.dispatch({
        type: 'leadsApi/executeMutation/fulfilled',
        payload: { id: 'lead-123', stage: 'Qualified' },
        meta: {
          arg: {
            endpointName: 'updateLeadStage',
            originalArgs: { id: 'lead-123', stageName: 'Qualified' },
          },
          requestStatus: 'fulfilled',
        },
      });

      // Verify cross-feature invalidations were triggered
      expect(dashboardInvalidateSpy).toHaveBeenCalledWith(['DashboardMetrics']);
      expect(reportsInvalidateSpy).toHaveBeenCalledWith(['Reports']);
      expect(activityLogInvalidateSpy).toHaveBeenCalledWith(['ActivityLogs']);

      dashboardInvalidateSpy.mockRestore();
      reportsInvalidateSpy.mockRestore();
      activityLogInvalidateSpy.mockRestore();
    });
  });

  describe('Part 3: Role Edit Cache Invalidation (Proves A-14)', () => {
    it('proves A-14: editing role permissions invalidates role cache by name so editor shows new permissions immediately', async () => {
      // Initial permissions query for role "Manager"
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            id: 'role-mgr-uuid',
            name: 'Manager',
            permissions: [
              { permission: { id: 'perm-read', name: 'lead:read' } },
            ],
          },
        },
      });

      // 1. Initial query with an active subscription (as in the Permissions modal)
      const sub = store.dispatch(
        teamApi.endpoints.getRoleById.initiate('Manager', { subscribe: true })
      );
      await sub;
      expect(axiosInstance.get).toHaveBeenCalledTimes(1);
      expect(axiosInstance.get).toHaveBeenCalledWith('/admin/role/Manager');

      // 2. Mock response for the automatic re-fetch after cache invalidation
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            id: 'role-mgr-uuid',
            name: 'Manager',
            permissions: [
              { permission: { id: 'perm-read', name: 'lead:read' } },
              { permission: { id: 'perm-write', name: 'lead:write' } },
            ],
          },
        },
      });

      // Mock update permissions PATCH call
      vi.mocked(apiFetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Permissions updated successfully',
        }),
      } as Response);

      // 3. Perform mutation with roleId and roleName
      await store.dispatch(
        teamApi.endpoints.updateRolePermissions.initiate({
          id: 'role-mgr-uuid',
          permissions: ['perm-read', 'perm-write'],
          roleName: 'Manager',
        })
      );

      // 4. Wait for the re-fetch triggered by invalidation to complete
      await new Promise((resolve) => setTimeout(resolve, 50));

      // 5. Because cache was invalidated by roleName, RTK Query automatically refetched the fresh permissions!
      expect(axiosInstance.get).toHaveBeenCalledTimes(2);

      // 6. Verify the updated permissions are now immediately available in the store
      const updatedSelect = teamApi.endpoints.getRoleById.select('Manager')(store.getState());
      expect(updatedSelect.data).toEqual(['perm-read', 'perm-write']);

      sub.unsubscribe();
    });
  });
});
