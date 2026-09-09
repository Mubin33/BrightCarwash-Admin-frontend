import { useState, useEffect, useCallback } from 'react';
import { useGetLeadsQuery } from '@/services/leads.api';
import { useGroupsData } from '@/hooks/useGroupsData';
import { useGroupActions } from '@/hooks/useGroupActions';
import { getStages } from '@/services/stage.service';
import { mapStagesToOptions } from '@/lib/stage-utils';
import { toast } from 'react-toastify';
import type { StageOption } from '@/components/ui/StageDropdown';

export function useGroupsContent() {
    const [searchQuery, setSearchQuery] = useState('');
    const [stages, setStages] = useState<StageOption[]>([]);
    const [leadModalOpen, setLeadModalOpen] = useState(false);
    const [targetGroupId, setTargetGroupId] = useState<string | null>(null);
    const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);

    const { data: paginatedLeads, refetch: refetchLeads } = useGetLeadsQuery({ page: 1, limit: 100 });
    const allLeads = paginatedLeads?.data || [];

    const {
        groups,
        leads: groupLeads,
        isLoading,
        refetch,
        fetchGroupLeads,
        addGroupOptimistic,
        removeOptimisticGroup,
        addLeadToGroupOptimistic,
        updateLeadStageOptimistic,
    } = useGroupsData();

    const { handleStageChange, handleDeleteLead, handleDeleteGroup, handleAddLeadToGroup } = useGroupActions({
        refetch,
        refetchLeads,
        fetchGroupLeads,
        addLeadToGroupOptimistic,
        updateLeadStageOptimistic,
    });

    useEffect(() => {
        getStages().then((s) => setStages(mapStagesToOptions(s)));
    }, []);

    useEffect(() => {
        if (!createGroupModalOpen) { refetch(); refetchLeads(); }
    }, [createGroupModalOpen, refetch, refetchLeads]);

    useEffect(() => {
        if (groups.length > 0 && !isLoading) {
            const firstGroup = groups[0];
            if (firstGroup) fetchGroupLeads(firstGroup.id);
        }
    }, [groups, isLoading, fetchGroupLeads]);

    const handleLeadAdded = useCallback(async (leadId: string) => {
        if (!targetGroupId) return;
        const leadData = allLeads.find(l => l.id === leadId);
        const success = await handleAddLeadToGroup(targetGroupId, leadId, leadData);
        if (success) { setTargetGroupId(null); setLeadModalOpen(false); }
    }, [targetGroupId, allLeads, handleAddLeadToGroup]);

    const handleGroupCreated = useCallback(async (newGroup: any) => {
        const optimisticGroup = {
            id: newGroup.id || `temp_${Date.now()}`,
            name: newGroup.name,
            description: newGroup.description || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            brevoListId: newGroup.brevoListId || null,
            _count: { leads: 0 },
        };
        addGroupOptimistic(optimisticGroup);
        setCreateGroupModalOpen(false);
        toast.success(`Group "${newGroup.name}" created`);
        try { await refetch(); await refetchLeads(); } catch (error) { console.error('Error syncing groups:', error); }
    }, [addGroupOptimistic, refetch, refetchLeads]);

    return {
        groups,
        groupLeads,
        isLoading,
        searchQuery,
        setSearchQuery,
        stages,
        leadModalOpen,
        setLeadModalOpen,
        targetGroupId,
        setTargetGroupId,
        createGroupModalOpen,
        setCreateGroupModalOpen,
        allLeads,
        refetchLeads,
        handleStageChange,
        handleDeleteLead,
        handleDeleteGroup,
        handleAddLeadToGroup,
        handleLeadAdded,
        handleGroupCreated,
        refetch,
    };
}