"use client";

import { useEmailList } from "@/hooks/useEmailList";
import { EmailListHeader } from "./EmailListHeader";
import { EmailListTable } from "./EmailListTable";
import { EmailListSkeleton } from "./EmailListSkeleton";

export function EmailListContent() {
    const {
        logs,
        meta,
        isLoading,
        isFetching,
        search,
        setSearch,
        page,
        setPage,
        handleDelete,
    } = useEmailList();

    if (isLoading) {
        return <EmailListSkeleton />;
    }

    return (
        <div className="flex flex-col gap-6 w-full">
            <EmailListHeader search={search} onSearchChange={setSearch} />
            <EmailListTable
                logs={logs}
                meta={meta}
                page={page}
                onPageChange={setPage}
                onDelete={handleDelete}
                isLoading={isFetching}
            />
        </div>
    );
}