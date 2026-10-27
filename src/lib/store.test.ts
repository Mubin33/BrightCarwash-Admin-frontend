import { describe, it, expect, vi } from 'vitest';
import { allApis, resetAllApiCaches, store, type AppDispatch } from './store';

describe('RTK Query cache isolation & reset on logout (AUTH-004)', () => {
  it('registers all 23 RTK Query API slices in allApis', () => {
    expect(allApis.length).toBe(23);
    const reducerPaths = allApis.map((api) => api.reducerPath);
    expect(reducerPaths).toContain('leadsApi');
    expect(reducerPaths).toContain('paymentApi');
    expect(reducerPaths).toContain('teamApi');
    expect(reducerPaths).toContain('dashboardApi');
    expect(reducerPaths).toContain('chatboxApi');
    expect(reducerPaths).toContain('aiCampaignApi');
  });

  it('dispatches resetApiState on all 23 APIs and resets campaign creation slice', () => {
    const dispatchSpy = vi.fn() as unknown as AppDispatch;
    resetAllApiCaches(dispatchSpy);
    // 23 resetApiState actions + 1 resetCampaignCreation action = 24 dispatched actions
    expect(dispatchSpy).toHaveBeenCalledTimes(24);

    // Verify each API slice has its reset action dispatched
    for (const api of allApis) {
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: `${api.reducerPath}/resetApiState` })
      );
    }

    // Verify campaign creation slice is reset
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'campaignCreation/resetCampaignCreation' })
    );
  });

  it('can reset store directly without errors', () => {
    expect(() => resetAllApiCaches(store.dispatch)).not.toThrow();
  });
});
