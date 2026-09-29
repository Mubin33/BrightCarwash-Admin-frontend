"use client";

import { useState } from "react";
import { useEmailList } from "@/hooks/useEmailList";
import { EmailListHeader } from "./EmailListHeader";
import { EmailListTable } from "./EmailListTable";
import { EmailListSkeleton } from "./EmailListSkeleton";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Trash2 } from "lucide-react";
import type { EmailLog } from "@/types/email-list";

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

    const [logToDelete, setLogToDelete] = useState<EmailLog | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirmDelete = async () => {
        if (!logToDelete) return;
        setIsDeleting(true);
        try {
            await handleDelete(logToDelete);
            setLogToDelete(null);
        } finally {
            setIsDeleting(false);
        }
    };

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
                onDelete={(log) => setLogToDelete(log)}
                isLoading={isFetching}
            />

            {/* Delete Confirmation Modal */}
            {logToDelete && (
                <Modal
                    isOpen={!!logToDelete}
                    onClose={() => {
                        if (!isDeleting) setLogToDelete(null);
                    }}
                    title={
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#FEF3F2] flex items-center justify-center shrink-0">
                                <Trash2 className="text-[#D92D20]" size={20} />
                            </div>
                            <div>
                                <span className="text-[#1B1B1B] font-inter text-lg font-semibold">
                                    Delete Email Log
                                </span>
                                <p className="text-[#777980] font-inter text-xs">
                                    Confirm email log deletion
                                </p>
                            </div>
                        </div>
                    }
                    size="sm"
                >
                    <div className="flex flex-col gap-4">
                        <p className="text-[#475467] text-sm leading-relaxed">
                            Are you sure you want to delete this email log? This action cannot be undone.
                        </p>

                        <div className="p-3 rounded-lg border border-[#DFE1E7] bg-[#F8FAFB] flex flex-col gap-1 text-xs">
                            <div className="flex items-center justify-between text-[#777980]">
                                <span>Subject</span>
                                <span className="font-mono text-[11px] font-medium text-[#1B1B1B]">
                                    {logToDelete.id.slice(0, 8).toUpperCase()}
                                </span>
                            </div>
                            <span className="text-[#1B1B1B] font-medium truncate">
                                {logToDelete.subject}
                            </span>
                            {logToDelete.to && (
                                <span className="text-[#777980] text-[11px] truncate">
                                    To: {logToDelete.to}
                                </span>
                            )}
                        </div>

                        <div className="flex gap-3 justify-end pt-3 border-t border-[#E8E8E9]">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setLogToDelete(null)}
                                disabled={isDeleting}
                                className="px-5 rounded-xl"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="danger"
                                onClick={handleConfirmDelete}
                                isLoading={isDeleting}
                                loadingText="Deleting..."
                                className="px-5 rounded-xl bg-[#D92D20] hover:bg-[#B42318] text-white"
                            >
                                Delete Log
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
