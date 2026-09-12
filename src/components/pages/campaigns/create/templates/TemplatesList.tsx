"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { TemplatePreviewModal } from "@/components/pages/campaigns/create/templates/TemplatePreviewModal";
import { TemplatesFilters } from "@/components/pages/campaigns/create/templates/TemplatesFilters";
import { createTemplatesColumns } from "@/components/pages/campaigns/create/templates/TemplatesColumns";
import { useGetTemplatesQuery, useDeleteTemplateMutation } from "@/services/template.api";
import type { Template } from "@/types/template";
import { toast } from "react-toastify";

interface TemplatesListProps {
    onTemplateSelect?: (template: Template) => void;
    selectedTemplateId?: string | null;
}

export function TemplatesList({ onTemplateSelect }: TemplatesListProps) {
    const router = useRouter();
    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

    const { data, isLoading, error } = useGetTemplatesQuery({
        search: searchQuery || undefined,
        page: currentPage,
        limit,
    });

    const templates = data?.templates || [];
    const totalItems = data?.total || 0;
    const totalPages = data?.totalPages || 1;

    const [deleteTemplate] = useDeleteTemplateMutation();

    const handleSearch = () => {
        setSearchQuery(searchInput);
        setCurrentPage(1);
    };

    const handleView = (template: Template) => setPreviewTemplate(template);

    const handleEdit = (template: Template) => {
        if (template.editorType === 'PLAIN_TEXT') {
            router.push(`/campaigns/create/simple-editor?templateId=${template.id}`);
        } else {
            router.push(`/campaigns/create/editor?templateId=${template.id}`);
        }
    };

    const handleDelete = async (template: Template) => {
        if (!confirm(`Delete template "${template.name}"?`)) return;
        try {
            await deleteTemplate(template.id).unwrap();
            toast.success(`"${template.name}" deleted`);
        } catch {
            toast.error("Failed to delete template");
        }
    };

    const handleUse = (template: Template) => {
        onTemplateSelect?.(template);
        setPreviewTemplate(null);
    };

    const columns = useMemo(() => createTemplatesColumns({
        onView: handleView,
        onEdit: handleEdit,
        onDelete: handleDelete,
    }), []);

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4 w-full">
                <div className="h-10 bg-gray-200 rounded animate-pulse" />
                <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-12 text-[#FF4345] font-inter">
                Failed to load templates.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <TemplatesFilters
                searchInput={searchInput}
                onSearchChange={setSearchInput}
                onSearchSubmit={handleSearch}
                limit={limit}
                onLimitChange={(val) => { setLimit(val); setCurrentPage(1); }}
            />

            <DataTable columns={columns} data={templates} rowKey={(row) => row.id} className="w-full border border-[#E8E8E9] rounded-lg" />

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={totalItems} itemsPerPage={limit} />

            <TemplatePreviewModal isOpen={!!previewTemplate} onClose={() => setPreviewTemplate(null)} template={previewTemplate} onUse={handleUse} />
        </div>
    );
}