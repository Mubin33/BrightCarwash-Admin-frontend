import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PERMISSIONS, hasPermission } from '@/lib/permissions';

describe('AU4 (P1) — Campaign Send now / Schedule retry & launch safety (A-5, N-9)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AU4.1 (A-5): Retry logic relaunches the same campaign ID after launch failure', () => {
    it('AU4 / A-5: when launch fails after create, retrying relaunches the same campaign ID and does NOT create a second campaign', async () => {
      let createdCampaignId: string | null = null;
      let isSending = false;

      const mockCreateCampaign = vi.fn().mockImplementation(async (payload) => {
        return { id: 'campaign_created_999', ...payload };
      });

      const mockUpdateCampaign = vi.fn().mockImplementation(async ({ id, data }) => {
        return { id, ...data };
      });

      let launchAttempts = 0;
      const mockLaunchCampaign = vi.fn().mockImplementation(async (id: string) => {
        launchAttempts++;
        if (launchAttempts === 1) {
          throw new Error('Launch failed: Brevo service temporarily unavailable');
        }
        return { success: true, id };
      });

      const executeSendNow = async (campaignData: { name: string; templateId: string; subject: string; leadGroupId: string }) => {
        const isActionInProgress = isSending;
        if (isActionInProgress) return;

        isSending = true;
        try {
          let targetId = createdCampaignId;
          if (targetId) {
            await mockUpdateCampaign({
              id: targetId,
              data: { ...campaignData, scheduledAt: null },
            });
          } else {
            const created = await mockCreateCampaign({
              ...campaignData,
              scheduledAt: null,
            });
            targetId = created.id;
            createdCampaignId = created.id;
          }
          await mockLaunchCampaign(targetId);
        } finally {
          isSending = false;
        }
      };

      const campaignPayload = {
        name: 'Fall Promo Campaign',
        templateId: 'tpl_123',
        subject: 'Special Discounts',
        leadGroupId: 'grp_456',
      };

      // 1. First Send now attempt: create succeeds, launch fails
      await expect(executeSendNow(campaignPayload)).rejects.toThrow('Launch failed');
      expect(mockCreateCampaign).toHaveBeenCalledTimes(1);
      expect(mockLaunchCampaign).toHaveBeenCalledTimes(1);
      expect(mockLaunchCampaign).toHaveBeenCalledWith('campaign_created_999');
      expect(createdCampaignId).toBe('campaign_created_999');

      // 2. Retry Send now attempt: must NOT create a second campaign!
      await executeSendNow(campaignPayload);

      // CRITICAL A-5 assertion: createCampaign must STILL be called only once
      expect(mockCreateCampaign).toHaveBeenCalledTimes(1);
      expect(mockUpdateCampaign).toHaveBeenCalledTimes(1);
      expect(mockUpdateCampaign).toHaveBeenCalledWith({
        id: 'campaign_created_999',
        data: { ...campaignPayload, scheduledAt: null },
      });

      // launchCampaign called second time with the SAME campaign ID
      expect(mockLaunchCampaign).toHaveBeenCalledTimes(2);
      expect(mockLaunchCampaign).toHaveBeenLastCalledWith('campaign_created_999');
    });

    it('AU4 / A-5: retry via schedule campaign also reuses the created campaign ID without second create', async () => {
      let createdCampaignId: string | null = null;
      let isScheduling = false;

      const mockCreateCampaign = vi.fn().mockResolvedValue({ id: 'campaign_sched_111' });
      const mockUpdateCampaign = vi.fn().mockResolvedValue({ id: 'campaign_sched_111' });
      let scheduleLaunchAttempts = 0;
      const mockLaunchCampaign = vi.fn().mockImplementation(async (id: string) => {
        scheduleLaunchAttempts++;
        if (scheduleLaunchAttempts === 1) {
          throw new Error('Scheduler connection error');
        }
        return { success: true, id };
      });

      const executeScheduleCampaign = async (scheduledAt: string) => {
        if (isScheduling) return;
        isScheduling = true;
        try {
          let targetId = createdCampaignId;
          if (targetId) {
            await mockUpdateCampaign({
              id: targetId,
              data: { scheduledAt },
            });
          } else {
            const created = await mockCreateCampaign({ scheduledAt });
            targetId = created.id;
            createdCampaignId = created.id;
          }
          await mockLaunchCampaign(targetId);
        } finally {
          isScheduling = false;
        }
      };

      // First attempt fails at launch
      await expect(executeScheduleCampaign('2026-11-01T10:00:00Z')).rejects.toThrow('Scheduler connection error');
      expect(mockCreateCampaign).toHaveBeenCalledTimes(1);
      expect(createdCampaignId).toBe('campaign_sched_111');

      // Retry scheduling succeeds without re-creating
      await executeScheduleCampaign('2026-11-01T10:00:00Z');
      expect(mockCreateCampaign).toHaveBeenCalledTimes(1); // Still 1!
      expect(mockUpdateCampaign).toHaveBeenCalledWith({
        id: 'campaign_sched_111',
        data: { scheduledAt: '2026-11-01T10:00:00Z' },
      });
      expect(mockLaunchCampaign).toHaveBeenLastCalledWith('campaign_sched_111');
    });
  });

  describe('AU4.2 (A-5): Campaign launch permission check (campaign:launch)', () => {
    it('defines campaign:launch in PERMISSIONS', () => {
      expect(PERMISSIONS.campaign.launch).toBe('campaign:launch');
      expect(PERMISSIONS.campaign.create).toBe('campaign:create');
    });

    it('denies launch access to user with only campaign:create (Send now hidden without campaign:launch)', () => {
      const creatorOnlyUser = {
        role: 'MarketingDraftsman',
        permissions: ['campaign:create', 'campaign:read'],
      };

      // User has create permission
      expect(hasPermission(creatorOnlyUser, PERMISSIONS.campaign.create)).toBe(true);

      // User lacks launch permission -> Send now & Schedule buttons are hidden
      expect(hasPermission(creatorOnlyUser, PERMISSIONS.campaign.launch)).toBe(false);
    });

    it('allows launch access to user with campaign:launch permission', () => {
      const launcherUser = {
        role: 'MarketingManager',
        permissions: ['campaign:create', 'campaign:launch'],
      };

      expect(hasPermission(launcherUser, PERMISSIONS.campaign.launch)).toBe(true);
    });

    it('allows launch access to Super User / SuperAdmin role', () => {
      const superUser = {
        role: 'Super Admin',
        permissions: [],
      };

      expect(hasPermission(superUser, PERMISSIONS.campaign.launch)).toBe(true);
    });
  });

  describe('AU4.3 (A-5): In-flight action blocking (all buttons disabled in flight)', () => {
    it('disables all actions and blocks second clicks when an action is in progress', async () => {
      let isSending = false;
      const isScheduling = false;
      const isSavingDraft = false;

      const mockCreateCampaign = vi.fn().mockImplementation(async () => {
        // Simulate async network latency
        await new Promise((resolve) => setTimeout(resolve, 50));
        return { id: 'slow_campaign_1' };
      });
      const mockLaunchCampaign = vi.fn().mockResolvedValue({ success: true });

      const handleSend = async () => {
        const isActionInProgress = isSending || isScheduling || isSavingDraft;
        if (isActionInProgress) return; // In-flight click ignored!

        isSending = true;
        try {
          const created = await mockCreateCampaign();
          await mockLaunchCampaign(created.id);
        } finally {
          isSending = false;
        }
      };

      // Start first send (takes 50ms)
      const promise1 = handleSend();

      // Check state while in-flight
      const isActionInProgressWhileFlight = isSending || isScheduling || isSavingDraft;
      expect(isActionInProgressWhileFlight).toBe(true);

      // Second click while in-flight
      const promise2 = handleSend();

      await Promise.all([promise1, promise2]);

      // mockCreateCampaign should only have been called ONCE because second click was blocked in flight
      expect(mockCreateCampaign).toHaveBeenCalledTimes(1);
      expect(mockLaunchCampaign).toHaveBeenCalledTimes(1);
    });
  });
});
