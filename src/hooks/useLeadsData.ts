import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useGetLeadsQuery, useUpdateLeadStageMutation, useDeleteLeadMutation, useUpdateLeadPriorityMutation } from '@/services/leads.api';
import { getStages } from '@/services/stage.service';
import { mapStagesToOptions } from '@/lib/stage-utils';
import { useLeadSelection } from '@/hooks/useLeadSelection';
import type { StageOption } from '@/components/ui/StageDropdown';
import { toast } from 'react-toastify';

const ITEMS_PER_PAGE = 10;

export function useLeadsData(externalSearch?: string, leadType: 'all' | 'mine' = 'all', kanbanLimit?: number) {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [sourceFilter, setSourceFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [depositFilter, setDepositFilter] = useState('');
    const [searchSubmitted, setSearchSubmitted] = useState(false);

    const currentUser = useSelector((state: { auth: { user: { id: string } | null } }) => state.auth.user);
    const assignedToId = leadType === 'mine' && currentUser?.id ? currentUser.id : undefined;

    const limit = kanbanLimit || ITEMS_PER_PAGE;

    const {
        data: paginatedData,
        isLoading,
        isFetching,
        error,
        refetch
    } = useGetLeadsQuery({
        page: currentPage,
        limit,
        search: searchSubmitted ? (searchTerm || externalSearch || undefined) : undefined,
        source: sourceFilter || undefined,
        priority: priorityFilter || undefined,
        depositStatus: depositFilter || undefined,
        assignedToId,
    });

    const [updateStage] = useUpdateLeadStageMutation();
    const [updatePriority] = useUpdateLeadPriorityMutation();
    const [deleteLead] = useDeleteLeadMutation();
    const { selectedIds, handleSelectRow, handleSelectAll } = useLeadSelection();
    const [stages, setStages] = useState<StageOption[]>([]);

    const leads = paginatedData?.data || [];
    const totalItems = paginatedData?.total || 0;
    const totalPages = paginatedData?.totalPages || 1;
    const isPageLoading = isLoading || isFetching;

    const uniqueSources = useMemo(() => [...new Set(leads.map((l) => l.source))], [leads]);

    const refreshStages = useCallback(async () => {
        setStages(mapStagesToOptions(await getStages()));
    }, []);

    useEffect(() => {
        getStages().then((s) => setStages(mapStagesToOptions(s)));
    }, []);

    useEffect(() => {
        refetch();
    }, [currentPage, searchSubmitted, searchTerm, externalSearch, sourceFilter, priorityFilter, depositFilter, assignedToId, refetch]);

    const handleSearchSubmit = useCallback(() => {
        setSearchSubmitted(true);
        setCurrentPage(1);
    }, []);

    const handleStageChange = useCallback(async (id: string, stageName: string) => {
        try {
            await updateStage({ id, stageName }).unwrap();
            toast.success('Stage updated');
            refetch();
        } catch {
            toast.error('Failed to update stage');
        }
    }, [updateStage, refetch]);

    const handlePriorityChange = useCallback(async (id: string, priority: string) => {
        try {
            await updatePriority({ id, priority }).unwrap();
            toast.success('Priority updated');
            refetch();
        } catch {
            toast.error('Failed to update priority');
        }
    }, [updatePriority, refetch]);

    const handleDelete = useCallback(async (lead: any) => {
        try {
            await deleteLead(lead.id).unwrap();
            toast.success(`${lead.name} deleted`);
            refetch();
        } catch {
            toast.error('Failed to delete lead');
        }
    }, [deleteLead, refetch]);

    return {
        leads,
        totalItems,
        totalPages,
        isLoading,
        isPageLoading,
        error,
        paginatedData,
        currentPage,
        setCurrentPage,
        searchTerm,
        setSearchTerm,
        sourceFilter,
        setSourceFilter,
        priorityFilter,
        setPriorityFilter,
        depositFilter,
        setDepositFilter,
        uniqueSources,
        stages,
        refreshStages,
        selectedIds,
        handleSelectRow,
        handleSelectAll,
        handleStageChange,
        handlePriorityChange,
        handleDelete,
        handleSearchSubmit,
    };
}