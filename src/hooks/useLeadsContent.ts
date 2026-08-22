'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { getStages } from '@/services/stage.service';
import { mapStagesToOptions } from '@/lib/stage-utils';
import type { StageOption } from '@/components/ui/StageDropdown';

export function useLeadsContent() {
    const [modalOpen, setModalOpen] = useState(false);
    const [groupModalOpen, setGroupModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
    const [leadType, setLeadType] = useState<'all' | 'mine'>('all');
    const [selectedCount, setSelectedCount] = useState(0);
    const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
    const [stages, setStages] = useState<StageOption[]>([]);
    const [isExportOpen, setIsExportOpen] = useState(false);
    const exportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        getStages().then((s) => setStages(mapStagesToOptions(s)));
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
                setIsExportOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectionChange = useCallback((count: number, ids: string[]) => {
        setSelectedCount(count);
        setSelectedLeads(ids);
    }, []);

    const handleNewGroupClick = useCallback(() => setGroupModalOpen(true), []);

    return {
        modalOpen,
        setModalOpen,
        groupModalOpen,
        setGroupModalOpen,
        viewMode,
        setViewMode,
        leadType,
        setLeadType,
        selectedCount,
        selectedLeads,
        setSelectedLeads,
        stages,
        isExportOpen,
        setIsExportOpen,
        exportRef,
        handleSelectionChange,
        handleNewGroupClick,
    };
}