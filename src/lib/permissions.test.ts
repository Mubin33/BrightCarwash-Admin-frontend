import { describe, it, expect } from 'vitest';
import { hasPermission, PERMISSIONS, getDefaultLeadView, canAccessChatbot } from './permissions';
import { NAVIGATION_CONFIG } from '@/configs/navigation.config';

describe('hasPermission RBAC evaluation', () => {
  it('returns false for null or undefined user', () => {
    expect(hasPermission(null, PERMISSIONS.dashboard.view)).toBe(false);
    expect(hasPermission(undefined, PERMISSIONS.dashboard.view)).toBe(false);
  });

  it('allows access for superadmin role regardless of permissions array', () => {
    expect(hasPermission({ role: 'Super Admin', permissions: [] }, 'anything')).toBe(true);
    expect(hasPermission({ role: 'superadmin', permissions: [] }, 'lead:delete')).toBe(true);
    expect(hasPermission({ role: 'superuser', permissions: [] }, 'billing:create')).toBe(true);
  });

  it('allows access when user has global wildcard * or all', () => {
    expect(hasPermission({ permissions: ['*'] }, PERMISSIONS.lead.delete)).toBe(true);
    expect(hasPermission({ permissions: ['all'] }, PERMISSIONS.campaign.create)).toBe(true);
  });

  it('supports wildcard namespace permissions (e.g. lead:*)', () => {
    const user = { permissions: ['lead:*'] };
    expect(hasPermission(user, 'lead:read')).toBe(true);
    expect(hasPermission(user, 'lead:delete')).toBe(true);
    expect(hasPermission(user, 'campaign:read')).toBe(false);
  });

  it('supports matching when requested permission contains wildcard prefix', () => {
    const user = { permissions: ['dashboard:view'] };
    expect(hasPermission(user, 'dashboard:*')).toBe(true);
    expect(hasPermission(user, 'lead:*')).toBe(false);
  });

  it('handles array of required permissions (any match allowed)', () => {
    const user = { permissions: ['lead:read'] };
    expect(hasPermission(user, ['campaign:read', 'lead:read'])).toBe(true);
    expect(hasPermission(user, ['campaign:read', 'campaign:create'])).toBe(false);
  });

  it('denies access when user does not have permission', () => {
    const user = { permissions: ['lead:read'] };
    expect(hasPermission(user, PERMISSIONS.lead.delete)).toBe(false);
    expect(hasPermission(user, PERMISSIONS.campaign.create)).toBe(false);
  });
});

describe('AU10 (P1) — RBAC permissions & default views (Proves A-6, A-12)', () => {
  describe('Finding A-12: Lead view defaults by permission', () => {
    it('defines lead:view_all in PERMISSIONS', () => {
      expect(PERMISSIONS.lead.view_all).toBe('lead:view_all');
      expect(PERMISSIONS.lead.read).toBe('lead:read');
    });

    it('defaults to "mine" for a user with lead:read only (without lead:view_all)', () => {
      const readOnlyUser = {
        role: 'Staff',
        permissions: ['lead:read', 'dashboard:view'],
      };
      expect(hasPermission(readOnlyUser, PERMISSIONS.lead.read)).toBe(true);
      expect(hasPermission(readOnlyUser, PERMISSIONS.lead.view_all)).toBe(false);
      expect(getDefaultLeadView(readOnlyUser)).toBe('mine');
    });

    it('defaults to "all" for a user with lead:view_all permission', () => {
      const viewAllUser = {
        role: 'Manager',
        permissions: ['lead:read', 'lead:view_all', 'dashboard:view'],
      };
      expect(hasPermission(viewAllUser, PERMISSIONS.lead.read)).toBe(true);
      expect(hasPermission(viewAllUser, PERMISSIONS.lead.view_all)).toBe(true);
      expect(getDefaultLeadView(viewAllUser)).toBe('all');
    });

    it('defaults to "all" for a user with wildcard lead:* permission', () => {
      const wildcardLeadUser = {
        role: 'LeadAdmin',
        permissions: ['lead:*'],
      };
      expect(hasPermission(wildcardLeadUser, PERMISSIONS.lead.read)).toBe(true);
      expect(hasPermission(wildcardLeadUser, PERMISSIONS.lead.view_all)).toBe(true);
      expect(getDefaultLeadView(wildcardLeadUser)).toBe('all');
    });

    it('defaults to "all" for Super User / Super Admin role bypass', () => {
      const superUser = {
        role: 'Super Admin',
        permissions: [],
      };
      expect(hasPermission(superUser, PERMISSIONS.lead.read)).toBe(true);
      expect(hasPermission(superUser, PERMISSIONS.lead.view_all)).toBe(true);
      expect(getDefaultLeadView(superUser)).toBe('all');
    });

    it('defaults to "mine" when user is null or undefined', () => {
      expect(getDefaultLeadView(null)).toBe('mine');
      expect(getDefaultLeadView(undefined)).toBe('mine');
    });
  });

  describe('Finding A-6: Chatbot service role policy alignment (D-12)', () => {
    it('allows AI Chatbox access to users with Admin role and chatbot permission', () => {
      const adminUser = {
        role: 'Admin',
        permissions: ['chatbot-dashboard:view'],
      };
      expect(canAccessChatbot(adminUser)).toBe(true);
      expect(hasPermission(adminUser, PERMISSIONS.chatbot_dashboard.view)).toBe(true);
      expect(hasPermission(adminUser, 'chatbot-dashboard:*')).toBe(true);
    });

    it('allows AI Chatbox access to Super User / Super Admin role', () => {
      const superUser = {
        role: 'Super User',
        permissions: [],
      };
      expect(canAccessChatbot(superUser)).toBe(true);
      expect(hasPermission(superUser, PERMISSIONS.chatbot_dashboard.view)).toBe(true);

      const superAdminUser = {
        role: 'SuperAdmin',
        permissions: [],
      };
      expect(canAccessChatbot(superAdminUser)).toBe(true);
      expect(hasPermission(superAdminUser, PERMISSIONS.chatbot_dashboard.view)).toBe(true);
    });

    it('denies AI Chatbox access to Manager role even when chatbot-dashboard:view is granted (D-12 server refusal)', () => {
      // Proves A-6: Manager role was previously shown the chat pages on frontend
      // but the chatbot service admitted only Admin (D-12), causing 403 refusals.
      const managerWithChatbotPerm = {
        role: 'Manager',
        permissions: ['chatbot-dashboard:view', 'dashboard:view'],
      };
      expect(canAccessChatbot(managerWithChatbotPerm)).toBe(false);
      expect(hasPermission(managerWithChatbotPerm, PERMISSIONS.chatbot_dashboard.view)).toBe(false);
      expect(hasPermission(managerWithChatbotPerm, [PERMISSIONS.chatbot_dashboard.view, 'chatbot-dashboard:*'])).toBe(false);
    });

    it('denies AI Chatbox access to other non-admin roles (Staff, Sales, etc.)', () => {
      const staffUser = {
        role: 'Staff',
        permissions: ['chatbot-dashboard:view'],
      };
      expect(canAccessChatbot(staffUser)).toBe(false);
      expect(hasPermission(staffUser, PERMISSIONS.chatbot_dashboard.view)).toBe(false);

      const userWithoutPerms = {
        role: 'Admin',
        permissions: ['dashboard:view'],
      };
      expect(canAccessChatbot(userWithoutPerms)).toBe(false);
    });

    it('denies AI Chatbox access when user is null or undefined', () => {
      expect(canAccessChatbot(null)).toBe(false);
      expect(canAccessChatbot(undefined)).toBe(false);
    });
  });

  describe('Finding A-6 & AU10: Every navigation entry maps to the server permission it needs', () => {
    it('verifies every interactive route in NAVIGATION_CONFIG maps to required permission', () => {
      NAVIGATION_CONFIG.forEach((section) => {
        section.items.forEach((item) => {
          if (item.href && item.href !== '') {
            // Top level nav items with href must define a permission
            if (item.id !== 'settings') {
              expect(item.permission).toBeDefined();
            }
          }
          if (item.subItems) {
            item.subItems.forEach((sub) => {
              if (sub.href && sub.href !== '') {
                if (sub.id !== 'marketing-queries') {
                  expect(sub.permission).toBeDefined();
                }
              }
            });
          }
        });
      });
    });

    it('verifies lead:read allows access to the leads navigation item', () => {
      const leadsItem = NAVIGATION_CONFIG
        .flatMap((s) => s.items)
        .find((item) => item.id === 'leads');
      expect(leadsItem).toBeDefined();
      expect(leadsItem?.permission).toBe(PERMISSIONS.lead.read);

      const readOnlyUser = { permissions: ['lead:read'] };
      expect(hasPermission(readOnlyUser, leadsItem!.permission!)).toBe(true);
    });

    it('verifies AI chatbox navigation items require chatbot permissions that align with role policy', () => {
      const aiChatbox = NAVIGATION_CONFIG
        .flatMap((s) => s.items)
        .find((item) => item.id === 'ai-chatbox');
      expect(aiChatbox).toBeDefined();
      expect(aiChatbox?.permission).toEqual([
        PERMISSIONS.chatbot_dashboard.view,
        'chatbot-dashboard:*',
      ]);

      const manager = {
        role: 'Manager',
        permissions: ['chatbot-dashboard:view'],
      };
      // Manager is denied
      expect(hasPermission(manager, aiChatbox!.permission!)).toBe(false);

      const admin = {
        role: 'Admin',
        permissions: ['chatbot-dashboard:view'],
      };
      // Admin is allowed
      expect(hasPermission(admin, aiChatbox!.permission!)).toBe(true);
    });
  });
  describe('Chatbot Campaign granular permissions (read, create, update, delete, change_status)', () => {
    it('defines all 5 granular chatbot_campaign permissions in PERMISSIONS', () => {
      expect(PERMISSIONS.chatbot_campaign.read).toBe('chatbot_campaign:read');
      expect(PERMISSIONS.chatbot_campaign.create).toBe('chatbot_campaign:create');
      expect(PERMISSIONS.chatbot_campaign.update).toBe('chatbot_campaign:update');
      expect(PERMISSIONS.chatbot_campaign.delete).toBe('chatbot_campaign:delete');
      expect(PERMISSIONS.chatbot_campaign.change_status).toBe('chatbot_campaign:change_status');
    });

    it('allows read-only access for users with chatbot_campaign:read only', () => {
      const readOnlyUser = {
        role: 'Staff',
        permissions: ['chatbot_campaign:read'],
      };
      expect(hasPermission(readOnlyUser, PERMISSIONS.chatbot_campaign.read)).toBe(true);
      expect(hasPermission(readOnlyUser, PERMISSIONS.chatbot_campaign.create)).toBe(false);
      expect(hasPermission(readOnlyUser, PERMISSIONS.chatbot_campaign.update)).toBe(false);
      expect(hasPermission(readOnlyUser, PERMISSIONS.chatbot_campaign.delete)).toBe(false);
      expect(hasPermission(readOnlyUser, PERMISSIONS.chatbot_campaign.change_status)).toBe(false);
    });

    it('enforces granular actions (create, update, delete, change_status)', () => {
      const creator = {
        role: 'Staff',
        permissions: ['chatbot_campaign:read', 'chatbot_campaign:create'],
      };
      expect(hasPermission(creator, PERMISSIONS.chatbot_campaign.create)).toBe(true);
      expect(hasPermission(creator, PERMISSIONS.chatbot_campaign.update)).toBe(false);
      expect(hasPermission(creator, PERMISSIONS.chatbot_campaign.delete)).toBe(false);

      const editor = {
        role: 'Staff',
        permissions: ['chatbot_campaign:read', 'chatbot_campaign:update', 'chatbot_campaign:change_status'],
      };
      expect(hasPermission(editor, PERMISSIONS.chatbot_campaign.update)).toBe(true);
      expect(hasPermission(editor, PERMISSIONS.chatbot_campaign.change_status)).toBe(true);
      expect(hasPermission(editor, PERMISSIONS.chatbot_campaign.delete)).toBe(false);

      const deleter = {
        role: 'Staff',
        permissions: ['chatbot_campaign:read', 'chatbot_campaign:delete'],
      };
      expect(hasPermission(deleter, PERMISSIONS.chatbot_campaign.delete)).toBe(true);
      expect(hasPermission(deleter, PERMISSIONS.chatbot_campaign.create)).toBe(false);
    });

    it('grants full campaign access with wildcard chatbot_campaign:*', () => {
      const wildcardUser = {
        role: 'Manager',
        permissions: ['chatbot_campaign:*'],
      };
      expect(hasPermission(wildcardUser, PERMISSIONS.chatbot_campaign.read)).toBe(true);
      expect(hasPermission(wildcardUser, PERMISSIONS.chatbot_campaign.create)).toBe(true);
      expect(hasPermission(wildcardUser, PERMISSIONS.chatbot_campaign.update)).toBe(true);
      expect(hasPermission(wildcardUser, PERMISSIONS.chatbot_campaign.delete)).toBe(true);
      expect(hasPermission(wildcardUser, PERMISSIONS.chatbot_campaign.change_status)).toBe(true);
    });

    it('strictly denies chatbot_campaign access if user lacks chatbot_campaign permissions even with chatbot-dashboard:view', () => {
      const adminWithoutNewPermsYet = {
        role: 'Admin',
        permissions: ['chatbot-dashboard:view'],
      };
      expect(hasPermission(adminWithoutNewPermsYet, PERMISSIONS.chatbot_campaign.read)).toBe(false);
      expect(hasPermission(adminWithoutNewPermsYet, PERMISSIONS.chatbot_campaign.create)).toBe(false);
      expect(hasPermission(adminWithoutNewPermsYet, PERMISSIONS.chatbot_campaign.update)).toBe(false);
      expect(hasPermission(adminWithoutNewPermsYet, PERMISSIONS.chatbot_campaign.delete)).toBe(false);
      expect(hasPermission(adminWithoutNewPermsYet, PERMISSIONS.chatbot_campaign.change_status)).toBe(false);
    });

    it('allows access to AI chatbox campaigns navigation item with chatbot_campaign:read', () => {
      const aiChatbox = NAVIGATION_CONFIG
        .flatMap((s) => s.items)
        .find((item) => item.id === 'ai-chatbox');
      const campaignsSubItem = aiChatbox?.subItems?.find(
        (sub) => sub.id === 'ai-chatbox-campaigns'
      );
      expect(campaignsSubItem).toBeDefined();

      const userWithCampaignRead = {
        role: 'Staff',
        permissions: ['chatbot_campaign:read'],
      };
      expect(hasPermission(userWithCampaignRead, campaignsSubItem!.permission!)).toBe(true);
    });

    it('allows chatbot access for user when Admin role is among secondary roles in roles array', () => {
      const multiRoleUser = {
        role: 'Manager',
        roles: ['Manager', 'Admin'],
        permissions: ['chatbot-dashboard:view'],
      };
      expect(canAccessChatbot(multiRoleUser)).toBe(true);
      expect(hasPermission(multiRoleUser, PERMISSIONS.chatbot_dashboard.view)).toBe(true);
    });

    it('strictly isolates chatbot_campaign from marketing campaign permissions', () => {
      const marketingUser = {
        role: 'Admin',
        permissions: [
          'campaign:read',
          'campaign:create',
          'campaign:update',
          'campaign:delete',
          'campaign:change_status',
        ],
      };
      // User with marketing campaign permissions must NOT have access to chatbot campaigns
      expect(hasPermission(marketingUser, PERMISSIONS.chatbot_campaign.read)).toBe(false);
      expect(hasPermission(marketingUser, PERMISSIONS.chatbot_campaign.create)).toBe(false);
      expect(hasPermission(marketingUser, PERMISSIONS.chatbot_campaign.update)).toBe(false);
      expect(hasPermission(marketingUser, PERMISSIONS.chatbot_campaign.delete)).toBe(false);
      expect(hasPermission(marketingUser, PERMISSIONS.chatbot_campaign.change_status)).toBe(false);

      // But has full access to marketing campaigns
      expect(hasPermission(marketingUser, PERMISSIONS.campaign.read)).toBe(true);
      expect(hasPermission(marketingUser, PERMISSIONS.campaign.create)).toBe(true);
    });

    it('supports chatbot-campaign kebab-case alias for chatbot_campaign', () => {
      const chatbotKebabUser = {
        role: 'Admin',
        permissions: ['chatbot-campaign:read'],
      };
      expect(hasPermission(chatbotKebabUser, PERMISSIONS.chatbot_campaign.read)).toBe(true);
      expect(hasPermission(chatbotKebabUser, PERMISSIONS.chatbot_campaign.create)).toBe(false);
    });
  });
});
