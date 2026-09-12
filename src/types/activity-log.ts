export interface ActivityLog {
    id: string;
    action: string;
    entity: string;
    entityId: string | null;
    changes: Record<string, any> | null;
    metadata: {
        ip: string;
        userAgent: string;
    };
    description: string;
    createdAt: string;
    updatedAt: string;
    userId: string | null;
}

export interface ActivityLogsResponse {
    success: boolean;
    message: string;
    data: ActivityLog[];
    meta: {
        page: number;
        limit: number;
        total_count: number;
        total_pages: number;
        has_next: boolean;
        has_previous: boolean;
    };
}

export interface ActivityLogFilters {
    search: string;
    action: string;
    entity: string;
    timeRange: string;
}