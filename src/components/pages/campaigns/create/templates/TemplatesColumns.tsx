import { Eye, Trash2, Pencil } from "lucide-react";
import type { Column } from "@/components/ui/DataTable";
import type { Template } from "@/types/template";

interface TemplatesColumnsParams {
    onView: (template: Template) => void;
    onEdit: (template: Template) => void;
    onDelete: (template: Template) => void;
}

export function createTemplatesColumns({ onView, onEdit, onDelete }: TemplatesColumnsParams): Column<Template>[] {
    return [
        {
            key: "preview",
            header: "Preview",
            className: "w-24",
            render: (row) => {
                const htmlContent = row.html || row.emailBody?.htmlContent || "";
                return (
                    <div className="w-20 h-14 rounded border border-[#DFE1E7] overflow-hidden bg-[#F8FAFB]">
                        <iframe
                            srcDoc={htmlContent}
                            title={row.name}
                            className="w-full h-full pointer-events-none"
                            sandbox="allow-same-origin"
                            style={{ transform: "scale(0.3)", transformOrigin: "0 0", width: "333%", height: "333%" }}
                        />
                    </div>
                );
            },
        },
        {
            key: "name",
            header: "Name",
            render: (row) => (
                <span className="text-[#1B1B1B] font-inter text-sm font-medium">{row.name}</span>
            ),
        },
        {
            key: "type",
            header: "Type",
            render: (row) => (
                <span className="text-[#1B1B1B] font-inter text-sm">{row.type}</span>
            ),
        },
        {
            key: "editor",
            header: "Editor",
            render: (row) => (
                <span className="text-[#1B1B1B] font-inter text-sm">{row.editorType?.replace(/_/g, " ")}</span>
            ),
        },
        {
            key: "actions",
            header: "Actions",
            className: "w-36",
            render: (row) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onView(row)}
                        className="p-2 rounded-lg text-[#777980] hover:bg-[#F8FAFB] hover:text-[#0098E8] transition-colors"
                        title="View"
                    >
                        <Eye size={16} />
                    </button>
                    <button
                        onClick={() => onEdit(row)}
                        className="p-2 rounded-lg text-[#777980] hover:bg-[#F8FAFB] hover:text-[#0098E8] transition-colors"
                        title="Edit"
                    >
                        <Pencil size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(row)}
                        className="p-2 rounded-lg text-[#777980] hover:bg-[#FFE6E6] hover:text-[#FF4345] transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
        },
    ];
}