export const PERMISSIONS = {
  dashboard: {
    view: "dashboard:view" as const,
  },
  chatbot_dashboard: {
    view: "chatbot-dashboard:view" as const,
  },
  chatbot: {
    view: "chatbot-dashboard:view" as const,
  },
  chatbot_campaign: {
    read: "chatbot_campaign:read" as const,
    create: "chatbot_campaign:create" as const,
    update: "chatbot_campaign:update" as const,
    delete: "chatbot_campaign:delete" as const,
    change_status: "chatbot_campaign:change_status" as const,
  },
  lead: {
    read: "lead:read" as const,
    view_all: "lead:view_all" as const,
    create: "lead:create" as const,
    update: "lead:update" as const,
    delete: "lead:delete" as const,
    assign: "lead:assign" as const,
    unassign: "lead:unassign" as const,
    export: "lead:export" as const,
    import: "lead:import" as const,
  },
  campaign: {
    read: "campaign:read" as const,
    create: "campaign:create" as const,
    update: "campaign:update" as const,
    delete: "campaign:delete" as const,
    launch: "campaign:launch" as const,
  },
  member: {
    read: "member:read" as const,
    block: "member:block" as const,
    unblock: "member:unblock" as const,
    roles_update: "member:roles_update" as const,
  },
  role: {
    read: "role:read" as const,
    create: "role:create" as const,
    update: "role:update" as const,
    delete: "role:delete" as const,
  },
  template: {
    read: "template:read" as const,
    create: "template:create" as const,
    update: "template:update" as const,
    delete: "template:delete" as const,
  },
  faq: {
    read: "faq:read" as const,
    create: "faq:create" as const,
    update: "faq:update" as const,
    delete: "faq:delete" as const,
  },
  section: {
    read: "website-sections:read" as const,
    create: "website-sections:create" as const,
    update: "website-sections:update" as const,
    delete: "website-sections:delete" as const,
  },
  gallery: {
    read: "gallery:read" as const,
    create: "gallery:create" as const,
    update: "gallery:update" as const,
    delete: "gallery:delete" as const,
  },
  testimonial: {
    read: "testimonial:read" as const,
    create: "testimonial:create" as const,
    update: "testimonial:update" as const,
    delete: "testimonial:delete" as const,
  },
  news_and_events: {
    read: "news-and-events:read" as const,
    create: "news-and-events:create" as const,
    update: "news-and-events:update" as const,
    delete: "news-and-events:delete" as const,
  },
  news_category: {
    read: "news-and-events-category:read" as const,
    create: "news-and-events-category:create" as const,
    update: "news-and-events-category:update" as const,
    delete: "news-and-events-category:delete" as const,
  },
  mail_management: {
    view_logs: "mail-management:view_logs" as const,
    send_email: "mail-management:send_email" as const,
  },
  payment_transaction: {
    read: "payment-transaction:read" as const,
    export: "payment-transaction:export" as const,
  },
  activity_log: {
    read: "activity-log:read" as const,
    create: "activity-log:create" as const,
    update: "activity-log:update" as const,
    delete: "activity-log:delete" as const,
  },
  stage: {
    read: "stage:read" as const,
    create: "stage:create" as const,
    update: "stage:update" as const,
    delete: "stage:delete" as const,
  },
  staff: {
    invite: "staff:invite" as const,
  },
  permission: {
    read: "permission:read" as const,
  },
  billing: {
    read: "billing:read" as const,
    create: "billing:create" as const,
    update: "billing:update" as const,
    delete: "billing:delete" as const,
  },
  system: {
    maintenance: "system:maintenance" as const,
  },
  user: {
    read: "user:read" as const,
    create: "user:create" as const,
    update: "user:update" as const,
    delete: "user:delete" as const,
  },
  lead_group: {
    read: "lead_group:read" as const,
    create: "lead_group:create" as const,
    update: "lead_group:update" as const,
    delete: "lead_group:delete" as const,
    connect: "lead_group:connect" as const,
    disconnect: "lead_group:disconnect" as const,
    export: "lead_group:export" as const,
  },
  report: {
    stage: "report:stage" as const,
    campaign: "report:campaign" as const,
    member: "report:member" as const,
    deposit_revenue: "report:deposit_revenue" as const,
  },
  admin_override: {
    delete: "admin_override:delete" as const,
  },
} as const;

export function hasPermission(
  user: { permissions?: string[]; role?: string; roles?: string[] } | null | undefined,
  permission: string | string[],
): boolean {
  if (!user) return false;

  // Multi-role support: collect all roles assigned to user
  const userRoles = [
    ...(user.role ? [user.role] : []),
    ...(Array.isArray(user.roles) ? user.roles : []),
  ];
  const normalizedRoles = userRoles.map((r) =>
    r.toLowerCase().replace(/[\s_-]/g, ""),
  );

  // Special case for AI Chatbot (Finding A-6 / D-12):
  // The chatbot dashboard service admits only admin-level roles ('admin', 'superadmin', 'superuser').
  // Checks all assigned roles so admins with secondary roles are not blocked.
  const isChatbotDashboardPerm = (p: string) => {
    const lp = p.toLowerCase();
    return lp.startsWith("chatbot-dashboard") || lp === "chatbot:view";
  };

  const isChatbotCheck = Array.isArray(permission)
    ? permission.every(isChatbotDashboardPerm)
    : isChatbotDashboardPerm(permission);

  if (isChatbotCheck) {
    const isAllowedChatbotRole = normalizedRoles.some(
      (nr) => nr === "admin" || nr === "superadmin" || nr === "superuser",
    );
    if (!isAllowedChatbotRole) {
      return false;
    }
  }

  // SuperAdmin role bypass across all assigned roles
  if (normalizedRoles.some((nr) => nr === "superadmin" || nr === "superuser")) {
    return true;
  }

  if (!user.permissions) return false;

  const check = (perm: string) => {
    const lowerPerm = perm.toLowerCase();

    // Support kebab-case and snake_case variations for chatbot_campaign
    const candidatePerms = [lowerPerm];
    if (lowerPerm.startsWith("chatbot_campaign:")) {
      const action = lowerPerm.slice("chatbot_campaign:".length);
      candidatePerms.push(`chatbot-campaign:${action}`);
    } else if (lowerPerm.startsWith("chatbot-campaign:")) {
      const action = lowerPerm.slice("chatbot-campaign:".length);
      candidatePerms.push(`chatbot_campaign:${action}`);
    }

    return candidatePerms.some((target) => {
      if (target.endsWith(":*")) {
        const prefix = target.slice(0, -1);
        return user.permissions!.some((p) => p.toLowerCase().startsWith(prefix));
      }
      return (
        user.permissions!.includes(target) ||
        user.permissions!.some((p) => {
          const lowerP = p.toLowerCase();
          if (lowerP === "*" || lowerP === "all") return true;
          if (lowerP.endsWith(":*")) {
            const prefix = lowerP.slice(0, -1);
            return target.startsWith(prefix);
          }
          return lowerP === target;
        })
      );
    });
  };

  if (Array.isArray(permission)) {
    return permission.some(check);
  }
  return check(permission);
}

export function canAccessChatbot(
  user: { permissions?: string[]; role?: string; roles?: string[] } | null | undefined,
): boolean {
  return hasPermission(user, [
    PERMISSIONS.chatbot_dashboard.view,
    "chatbot-dashboard:*",
  ]);
}

export function getDefaultLeadView(
  user: { permissions?: string[]; role?: string } | null | undefined,
): "all" | "mine" {
  if (hasPermission(user, PERMISSIONS.lead.view_all)) {
    return "all";
  }
  return "mine";
}