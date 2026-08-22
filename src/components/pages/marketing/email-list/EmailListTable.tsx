"use client";

import { useMemo } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { createEmailListColumns } from "./EmailListColumns";
import type { EmailLog } from "@/types/email-list";

interface EmailListTableProps {
    logs: EmailLog[];
    meta: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        itemsPerPage: number;
    };
    page: number;
    onPageChange: (page: number) => void;
    onDelete: (log: EmailLog) => void;
    isLoading: boolean;
}

export function EmailListTable({
    logs,
    meta,
    page,
    onPageChange,
    onDelete,
    isLoading,
}: EmailListTableProps) {
    const columns = useMemo(() => createEmailListColumns({ onDelete }), [onDelete]);

    return (
        <div className="flex flex-col gap-4 w-full">
            <DataTable
                columns={columns}
                data={logs}
                rowKey={(row) => row.id}
                className="w-full border border-[#E8E8E9] rounded-lg"
            />
            <Pagination
                currentPage={page}
                totalPages={meta.totalPages}
                onPageChange={onPageChange}
                totalItems={meta.totalItems}
                itemsPerPage={meta.itemsPerPage}
                isLoading={isLoading}
            />
        </div>
    );
}