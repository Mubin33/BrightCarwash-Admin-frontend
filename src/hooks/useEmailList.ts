"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import { toast } from "react-toastify";
import { useGetEmailLogsQuery, useDeleteEmailLogMutation } from "@/services/email-list.api";

export function useEmailList() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const page = Number(searchParams.get("page")) || 1;
    const search = searchParams.get("search") || "";

    const { data, isLoading, isFetching } = useGetEmailLogsQuery({
        page,
        limit: 10,
        search: search || undefined,
    });

    const [deleteLog, { isLoading: isDeleting }] = useDeleteEmailLogMutation();

    const logs = data?.data?.data || [];
    const meta = data?.data?.meta || {
        totalItems: 0,
        itemCount: 0,
        itemsPerPage: 10,
        totalPages: 1,
        currentPage: 1,
    };

    const updateParams = useCallback(
        (updates: Record<string, string | null>) => {
            const params = new URLSearchParams(searchParams.toString());
            Object.entries(updates).forEach(([key, value]) => {
                if (value === null || value === "") {
                    params.delete(key);
                } else {
                    params.set(key, value);
                }
            });
            router.push(`${pathname}?${params.toString()}`);
        },
        [searchParams, router, pathname]
    );

    const setSearch = useCallback(
        (value: string) => {
            updateParams({ search: value || null, page: null });
        },
        [updateParams]
    );

    const setPage = useCallback(
        (newPage: number) => {
            updateParams({ page: String(newPage) });
        },
        [updateParams]
    );

    const handleDelete = useCallback(
        async (log: { id: string; subject: string }) => {
            if (!confirm(`Delete "${log.subject}"?`)) return;
            try {
                await deleteLog(log.id).unwrap();
                toast.success("Email log deleted");
            } catch {
                toast.error("Failed to delete email log");
            }
        },
        [deleteLog]
    );

    return {
        logs,
        meta,
        isLoading,
        isFetching,
        isDeleting,
        search,
        setSearch,
        page,
        setPage,
        handleDelete,
    };
}