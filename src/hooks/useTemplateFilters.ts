"use client";

import { useState, useMemo, useCallback } from "react";
import type { Template, TemplateType, EditorType } from "@/types/template";

export function useTemplateFilters(templates: Template[]) {
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState<TemplateType | "All">("All");
    const [editorFilter, setEditorFilter] = useState<EditorType | "All">("All");
    const [showArchived, setShowArchived] = useState(false);

    const filtered = useMemo(
        () =>
            templates.filter((template) => {
                // Search
                if (searchQuery) {
                    const q = searchQuery.toLowerCase();
                    const match =
                        template.name.toLowerCase().includes(q) ||
                        (template.description?.toLowerCase().includes(q) ?? false);
                    if (!match) return false;
                }

                // Type filter
                if (typeFilter !== "All" && template.type !== typeFilter) {
                    return false;
                }

                // Editor filter
                if (editorFilter !== "All" && template.editorType !== editorFilter) {
                    return false;
                }

                // Archived filter
                if (!showArchived && template.isArchived) {
                    return false;
                }

                return true;
            }),
        [templates, searchQuery, typeFilter, editorFilter, showArchived]
    );

    const setSearchQueryMemo = useCallback((value: string) => setSearchQuery(value), []);
    const setTypeFilterMemo = useCallback((value: TemplateType | "All") => setTypeFilter(value), []);
    const setEditorFilterMemo = useCallback((value: EditorType | "All") => setEditorFilter(value), []);
    const setShowArchivedMemo = useCallback((value: boolean) => setShowArchived(value), []);

    return {
        searchQuery,
        setSearchQuery: setSearchQueryMemo,
        typeFilter,
        setTypeFilter: setTypeFilterMemo,
        editorFilter,
        setEditorFilter: setEditorFilterMemo,
        showArchived,
        setShowArchived: setShowArchivedMemo,
        filtered,
    };
}