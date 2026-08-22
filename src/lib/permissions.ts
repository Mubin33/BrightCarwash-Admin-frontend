export const PERMISSIONS = {
    lead: {
        read: 'lead:read' as const,
        create: 'lead:create' as const,
        update: 'lead:update' as const,
        delete: 'lead:delete' as const,
        assign: 'lead:assign' as const,
        unassign: 'lead:unassign' as const,
        export: 'lead:export' as const,
        import: 'lead:import' as const,
    },
    campaign: {
        read: 'campaign:read' as const,
        create: 'campaign:create' as const,
        update: 'campaign:update' as const,
        delete: 'campaign:delete' as const,
    },
    member: {
        read: 'member:read' as const,
        block: 'member:block' as const,
        unblock: 'member:unblock' as const,
        roles_update: 'member:roles_update' as const,
    },
    role: {
        read: 'role:read' as const,
        create: 'role:create' as const,
        update: 'role:update' as const,
        delete: 'role:delete' as const,
    },
    template: {
        read: 'template:read' as const,
        create: 'template:create' as const,
        update: 'template:update' as const,
        delete: 'template:delete' as const,
    },
    faq: {
        read: 'faq:read' as const,
        create: 'faq:create' as const,
        update: 'faq:update' as const,
        delete: 'faq:delete' as const,
    },
    section: {
        read: 'section:read' as const,
        create: 'section:create' as const,
        update: 'section:update' as const,
        delete: 'section:delete' as const,
    },
    gallery: {
        read: 'gallery:read' as const,
        create: 'gallery:create' as const,
        update: 'gallery:update' as const,
        delete: 'gallery:delete' as const,
    },
    testimonial: {
        read: 'testimonial:read' as const,
        create: 'testimonial:create' as const,
        update: 'testimonial:update' as const,
        delete: 'testimonial:delete' as const,
    },
    news_and_events: {
        read: 'news-and-events:read' as const,
        create: 'news-and-events:create' as const,
        update: 'news-and-events:update' as const,
        delete: 'news-and-events:delete' as const,
    },
    news_category: {
        read: 'news-and-events-category:read' as const,
        create: 'news-and-events-category:create' as const,
        update: 'news-and-events-category:update' as const,
        delete: 'news-and-events-category:delete' as const,
    },
    mail_management: {
        view_logs: 'mail-management:view_logs' as const,
        send_email: 'mail-management:send_email' as const,
    },
    payment_transaction: {
        read: 'payment-transaction:read' as const,
        export: 'payment-transaction:export' as const,
    },
    activity_log: {
        read: 'activity-log:read' as const,
        create: 'activity-log:create' as const,
        update: 'activity-log:update' as const,
        delete: 'activity-log:delete' as const,
    },
    stage: {
        read: 'stage:read' as const,
        create: 'stage:create' as const,
        update: 'stage:update' as const,
        delete: 'stage:delete' as const,
    },
    staff: {
        invite: 'staff:invite' as const,
    },
    permission: {
        read: 'permission:read' as const,
    },
    billing: {
        read: 'billing:read' as const,
        create: 'billing:create' as const,
        update: 'billing:update' as const,
        delete: 'billing:delete' as const,
    },
    system: {
        maintenance: 'system:maintenance' as const,
    },
    user: {
        read: 'user:read' as const,
        create: 'user:create' as const,
        update: 'user:update' as const,
        delete: 'user:delete' as const,
    },
    lead_group: {
        read: 'lead_group:read' as const,
        create: 'lead_group:create' as const,
        update: 'lead_group:update' as const,
        delete: 'lead_group:delete' as const,
        connect: 'lead_group:connect' as const,
        disconnect: 'lead_group:disconnect' as const,
        export: 'lead_group:export' as const,
    },
    admin_override: {
        delete: 'admin_override:delete' as const,
    },
} as const;

export function hasPermission(user: { permissions: string[] } | null | undefined, permission: string): boolean {
    if (!user?.permissions) return false;
    return user.permissions.includes(permission);
}