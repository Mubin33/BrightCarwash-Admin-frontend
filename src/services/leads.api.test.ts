import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as apiFetchModule from '@/lib/api-fetch';
import { leadsApi } from './leads.api';
import { store } from '@/lib/store';

describe('leadsApi assigned-to-me query endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('routes to /admin/lead/assigned-to-me when isAssignedToMe is true', async () => {
    const fetchMock = vi.spyOn(apiFetchModule, 'fetchFromBackend').mockResolvedValue({
      success: true,
      message: 'OK',
      data: [],
      meta: {
        page: 1,
        limit: 10,
        total_count: 0,
        total_pages: 1,
        has_next: false,
        has_previous: false,
      },
    });

    await store.dispatch(
      leadsApi.endpoints.getLeads.initiate({
        page: 1,
        limit: 10,
        isAssignedToMe: true,
        search: 'John',
        priority: 'HIGH',
      })
    );

    expect(fetchMock).toHaveBeenCalled();
    const calledUrl = fetchMock.mock.calls[0][0];
    expect(calledUrl).toContain('/admin/lead/assigned-to-me');
    expect(calledUrl).toContain('search=John');
    expect(calledUrl).toContain('priority=HIGH');
    expect(calledUrl).not.toContain('assigned_to_id=');
  });

  it('routes to /admin/lead when isAssignedToMe is false or omitted', async () => {
    const fetchMock = vi.spyOn(apiFetchModule, 'fetchFromBackend').mockResolvedValue({
      success: true,
      message: 'OK',
      data: [],
      meta: {
        page: 1,
        limit: 10,
        total_count: 0,
        total_pages: 1,
        has_next: false,
        has_previous: false,
      },
    });

    await store.dispatch(
      leadsApi.endpoints.getLeads.initiate({
        page: 1,
        limit: 10,
        isAssignedToMe: false,
        assignedToId: 'user_456',
      })
    );

    expect(fetchMock).toHaveBeenCalled();
    const calledUrl = fetchMock.mock.calls[0][0];
    expect(calledUrl).toContain('/admin/lead?');
    expect(calledUrl).not.toContain('/admin/lead/assigned-to-me');
    expect(calledUrl).toContain('assigned_to_id=user_456');
  });

  it('getAssignedToMeLeads query calls /admin/lead/assigned-to-me directly', async () => {
    const fetchMock = vi.spyOn(apiFetchModule, 'fetchFromBackend').mockResolvedValue({
      success: true,
      message: 'OK',
      data: [],
      meta: {
        page: 2,
        limit: 15,
        total_count: 30,
        total_pages: 2,
        has_next: false,
        has_previous: true,
      },
    });

    await store.dispatch(
      leadsApi.endpoints.getAssignedToMeLeads.initiate({
        page: 2,
        limit: 15,
        stageId: 'stage_123',
      })
    );

    expect(fetchMock).toHaveBeenCalled();
    const calledUrl = fetchMock.mock.calls[0][0];
    expect(calledUrl).toContain('/admin/lead/assigned-to-me');
    expect(calledUrl).toContain('page=2');
    expect(calledUrl).toContain('limit=15');
    expect(calledUrl).toContain('stage_id=stage_123');
  });
});
