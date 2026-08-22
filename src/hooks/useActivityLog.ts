"use client";

import { useState, useEffect, useMemo } from 'react';
import { useGetActivityLogsQuery } from '@/services/activity-log.api';
import { useActivityLogFilters } from './useActivityLogFilters';

export function useActivityLog(initialPage = 1, initialLimit = 10) {
    const [page, setPage] = useState(initialPage);
    const [limit] = useState(initialLimit);
    const filters = useActivityLogFilters();

    // Reset page to 1 when any filter changes
    useEffect(() => {
        setPage(1);
    }, [filters.search, filters.action, filters.timeRange]);

    const { data, isLoading, error, refetch } = useGetActivityLogsQuery({ page, limit });

    // Memoize filtered logs
    const filteredLogs = useMemo(() => {
        if (!data?.data) return [];

        return data.data.filter((log) => {
            // Search filter
            if (filters.search.trim()) {
                const query = filters.search.trim().toLowerCase();
                const matchesDescription = log.description.toLowerCase().includes(query);
                const matchesAction = log.action.toLowerCase().includes(query);
                const matchesEntity = log.entity.toLowerCase().includes(query);
                if (!matchesDescription && !matchesAction && !matchesEntity) return false;
            }

            // Action filter - "All types" or empty means no filter
            const actionFilter = filters.action;
            if (actionFilter && actionFilter !== 'All types' && log.action !== actionFilter) {
                return false;
            }

            // Time filter
            if (filters.timeRange !== 'All Time') {
                const now = new Date();
                const logDate = new Date(log.createdAt);
                const diffMs = now.getTime() - logDate.getTime();
                const diffDays = diffMs / (1000 * 60 * 60 * 24);

                switch (filters.timeRange) {
                    case 'Today':
                        if (diffDays > 1) return false;
                        break;
                    case 'Last 7 Days':
                        if (diffDays > 7) return false;
                        break;
                    case 'Last 30 Days':
                        if (diffDays > 30) return false;
                        break;
                    case 'Last 90 Days':
                        if (diffDays > 90) return false;
                        break;
                }
            }

            return true;
        });
    }, [data, filters.search, filters.action, filters.timeRange]);

    return {
        logs: filteredLogs,
        totalCount: data?.meta?.total_count || 0,
        totalPages: data?.meta?.total_pages || 1,
        currentPage: page,
        hasNext: data?.meta?.has_next || false,
        hasPrevious: data?.meta?.has_previous || false,
        isLoading,
        error,
        refetch,
        setPage,
        filters,
    };
}