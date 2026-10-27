"use client";

import { RefreshCw, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FilterDropdown } from '@/components/ui/FilterDropdown';
import type { useActivityLogFilters } from '@/hooks/useActivityLogFilters';

interface ActivityLogHeaderProps {
    filters: ReturnType<typeof useActivityLogFilters>;
    onRefresh: () => void;
    isRefreshing?: boolean;
}

export function ActivityLogHeader({ filters, onRefresh, isRefreshing }: ActivityLogHeaderProps) {
    const isFiltered = !!filters.search || filters.action !== 'All types' || filters.timeRange !== 'All Time';

    const actionOptions = filters.ACTION_OPTIONS.filter((opt) => opt !== 'All types').map((opt) => ({
        value: opt,
        label: opt,
    }));

    const timeOptions = filters.TIME_OPTIONS.filter((opt) => opt !== 'All Time').map((opt) => ({
        value: opt,
        label: opt,
    }));

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 self-stretch">
            <div className="flex items-center gap-2 flex-1 flex-wrap">
                {/* Search Input */}
                <div className="relative flex-1 min-w-[200px] max-w-[340px]">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777980]" />
                    <input
                        type="text"
                        placeholder="Search logs by user, action, entity..."
                        value={filters.search}
                        onChange={(e) => filters.setSearch(e.target.value)}
                        className="w-full pl-9 pr-8 py-2.5 border border-[#E8E8E9] rounded-lg bg-white text-sm text-[#1B1B1B] placeholder-[#777980] font-inter outline-none focus:border-[#0098E8] transition-colors"
                    />
                    {filters.search && (
                        <button
                            type="button"
                            onClick={() => filters.setSearch('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#777980] hover:text-[#1B1B1B] p-0.5"
                            title="Clear search"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Action Filter */}
                <FilterDropdown
                    label="All types"
                    options={actionOptions}
                    value={filters.action === 'All types' ? '' : filters.action}
                    onChange={(val) => filters.setAction(val || 'All types')}
                />

                {/* Time Range Filter */}
                <FilterDropdown
                    label="All Time"
                    options={timeOptions}
                    value={filters.timeRange === 'All Time' ? '' : filters.timeRange}
                    onChange={(val) => filters.setTimeRange(val || 'All Time')}
                />

                {/* Reset Filters button */}
                {isFiltered && (
                    <button
                        type="button"
                        onClick={filters.resetFilters}
                        className="text-xs text-[#0098E8] hover:underline font-inter py-1 px-2 cursor-pointer"
                    >
                        Reset filters
                    </button>
                )}
            </div>

            <Button
                onClick={onRefresh}
                isLoading={isRefreshing}
                loadingText="Refreshing..."
                variant="outline"
                className="flex items-center gap-2 w-auto! shrink-0"
            >
                <RefreshCw size={16} />
                Refresh
            </Button>
        </div>
    );
}