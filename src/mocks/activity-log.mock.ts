import type { ActivityLog } from '@/types/activity-log';

export const mockActivityLogs: ActivityLog[] = [
    {
        id: '1',
        action: 'create',
        entity: 'lead',
        entityId: 'lead_001',
        changes: { name: 'John Doe', email: 'john@example.com' },
        metadata: { ip: '192.168.1.1', userAgent: 'Chrome/149' },
        description: 'A new lead has been created through the website form.',
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        userId: 'user_001',
    },
    {
        id: '2',
        action: 'update',
        entity: 'lead',
        entityId: 'lead_002',
        changes: { status: 'converted' },
        metadata: { ip: '192.168.1.2', userAgent: 'Firefox/120' },
        description: 'Lead status has been updated to "Converted".',
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        userId: 'user_002',
    },
];