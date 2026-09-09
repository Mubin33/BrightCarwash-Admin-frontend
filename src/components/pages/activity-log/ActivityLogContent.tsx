"use client";

import { useActivityLog } from '@/hooks/useActivityLog';
import { ActivityLogHeader } from './ActivityLogHeader';

import { ActivityLogTable } from './ActivityLogTable';
import { Pagination } from '@/components/ui/Pagination';

export function ActivityLogContent() {
    const {
        logs,
        totalCount,
        totalPages,
        currentPage,
        hasNext,
        hasPrevious,
        isLoading,
        refetch,
        setPage,
        filters,
    } = useActivityLog();

    return (
        <div className="flex flex-col gap-6 w-full p-4">
            <ActivityLogHeader onRefresh={refetch} isRefreshing={isLoading} />

            <ActivityLogTable logs={logs} isLoading={isLoading} />

            {!isLoading && totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    totalItems={totalCount}
                    itemsPerPage={10}
                />
            )}
        </div>
    );
}