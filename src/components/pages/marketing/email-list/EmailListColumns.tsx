import { Trash2 } from "lucide-react";
import type { Column } from "@/components/ui/DataTable";
import type { EmailLog } from "@/types/email-list";
import { hasPermission } from "@/lib/permissions";
import { PERMISSIONS } from "@/lib/permissions";
import { store } from "@/lib/store";

interface EmailListColumnsParams {
    onDelete: (log: EmailLog) => void;
}

export function createEmailListColumns({
    onDelete,
}: EmailListColumnsParams): Column<EmailLog>[] {
    const user = store.getState().auth.user;
    const canDelete = hasPermission(user, PERMISSIONS.mail_management.view_logs);

    return [
        {
            key: "code",
            header: "Code",
            render: (row) => (
                <span className="text-[#1B1B1B] font-inter text-sm font-medium">
                    {row.id.slice(0, 8).toUpperCase()}
                </span>
            ),
        },
        {
            key: "subject",
            header: "Subject",
            render: (row) => (
                <span className="text-[#1B1B1B] font-inter text-sm truncate max-w-60 block">
                    {row.subject}
                </span>
            ),
        },
        {
            key: "recipients",
            header: "Recipients",
            render: (row) => (
                <span className="text-[#1B1B1B] font-inter text-sm">{row.to}</span>
            ),
        },
        {
            key: "createdBy",
            header: "Created By",
            render: (row) => (
                <span className="text-[#1B1B1B] font-inter text-sm">
                    {row.creator
                        ? `${row.creator.first_name} ${row.creator.last_name}`
                        : "Admin"}
                </span>
            ),
        },
        {
            key: "actions",
            header: "Action",
            className: "w-12",
            render: (row) => {
                if (!canDelete) return null;
                return (
                    <button onClick={() => onDelete(row)} className="p-2 rounded-lg text-[#777980] hover:bg-[#FFE6E6] hover:text-[#FF4345] transition-colors" title="Delete">
                        <Trash2 size={16} />
                    </button>
                );
            },
        },
    ];
}