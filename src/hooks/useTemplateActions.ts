"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
    useDeleteTemplateMutation,
    useArchiveTemplateMutation,
} from "@/services/template.api";
import type { Template } from "@/types/template";

export function useTemplateActions() {
    const router = useRouter();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [archivingId, setArchivingId] = useState<string | null>(null);
    const [deleteTemplate] = useDeleteTemplateMutation();
    const [archiveTemplate] = useArchiveTemplateMutation();

    const handleEdit = useCallback(
        (template: Template) => router.push(`/templates/edit/${template.id}`),
        [router]
    );

    const handleDelete = useCallback(
        async (template: Template) => {
            if (!confirm(`Delete "${template.name}" permanently?`)) return;
            setDeletingId(template.id);
            try {
                await deleteTemplate(template.id).unwrap();
                toast.success(`"${template.name}" deleted`);
            } catch {
                toast.error("Failed to delete template");
            } finally {
                setDeletingId(null);
            }
        },
        [deleteTemplate]
    );

    const handleArchive = useCallback(
        async (template: Template) => {
            const action = template.isArchived ? "unarchive" : "archive";
            if (!confirm(`${action} "${template.name}"?`)) return;
            setArchivingId(template.id);
            try {
                await archiveTemplate(template.id).unwrap();
                toast.success(`"${template.name}" ${action}ed`);
            } catch (error: any) {
                toast.error(error?.data || `Failed to ${action} template`);
            } finally {
                setArchivingId(null);
            }
        },
        [archiveTemplate]
    );

    const handleDuplicate = useCallback(
        (template: Template) => {
            // Navigate to create with template data pre-filled
            router.push(`/templates/create?duplicate=${template.id}`);
        },
        [router]
    );

    return {
        handleEdit,
        handleDelete,
        handleArchive,
        handleDuplicate,
        deletingId,
        archivingId,
    };
}