"use client";

import { useState, useEffect } from 'react';
import { useGetActivityLogsQuery } from '@/services/activity-log.api';
import { useActivityLogFilters } from './useActivityLogFilters';

export function useActivityLog(initialPage = 1, initialLimit = 10) {
    const [page, setPage] = useState(initialPage);
    const [limit, setLimit] = useState(initialLimit);
    const filters = useActivityLogFilters();

    // Debounce search input by 350ms as recommended by the API Change Guide
    const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(filters.search);
        }, 350);
        return () => clearTimeout(timer);
    }, [filters.search]);

    // Reset page to 1 when any search or filter option changes (state adjustment during render)
    const filterKey = `${debouncedSearch}|${filters.action}|${filters.timeRange}`;
    const [prevFilterKey, setPrevFilterKey] = useState(filterKey);

    if (filterKey !== prevFilterKey) {
        setPrevFilterKey(filterKey);
        setPage(1);
    }

    // Query server with page, limit, and active filters (AU11 / A-13: Server-side filters)
    const { data, isLoading, error, refetch } = useGetActivityLogsQuery({
        page,
        limit,
        search: debouncedSearch.trim() || undefined,
        action: filters.action !== 'All types' ? filters.action : undefined,
        timeRange: filters.timeRange !== 'All Time' ? filters.timeRange : undefined,
    });

    const logs = data?.data || [];
    const totalCount = data?.meta?.total_count ?? 0;
    const totalPages = data?.meta?.total_pages ?? (totalCount > 0 ? 1 : 0);
    const hasNext = data?.meta?.has_next ?? (page < totalPages);
    const hasPrevious = data?.meta?.has_previous ?? (page > 1);

    return {
        logs,
        totalCount,
        totalPages,
        currentPage: page,
        hasNext,
        hasPrevious,
        isLoading,
        error,
        refetch,
        setPage,
        setLimit,
        filters,
    };
}
