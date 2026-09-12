"use client";

import { useState, useCallback } from 'react';

export const ACTION_OPTIONS = ['All types', 'create', 'update', 'delete', 'invite', 'read'];
export const TIME_OPTIONS = ['All Time', 'Today', 'Last 7 Days', 'Last 30 Days', 'Last 90 Days'];

export function useActivityLogFilters() {
    const [search, setSearch] = useState('');
    const [action, setAction] = useState('All types');
    const [timeRange, setTimeRange] = useState('All Time');

    const resetFilters = useCallback(() => {
        setSearch('');
        setAction('All types');
        setTimeRange('All Time');
    }, []);

    return {
        search,
        setSearch,
        action,
        setAction,
        timeRange,
        setTimeRange,
        resetFilters,
        ACTION_OPTIONS,
        TIME_OPTIONS,
    };
}