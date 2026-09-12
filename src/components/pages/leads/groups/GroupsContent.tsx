"use client";

import { useState, useEffect, useCallback, forwardRef, useImperativeHandle, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useGetLeadsQuery } from "@/services/leads.api";
import { useGroupsData } from "@/hooks/useGroupsData";
import { useGroupActions } from "@/hooks/useGroupActions";
import { getStages } from "@/services/stage.service";
import { useExportExcel } from "@/hooks/useExportExcel";
import { GroupsHeader } from "./GroupsHeader";
import { GroupsList } from "./GroupsList";
import { AddLeadModal } from "../kanban/AddLeadModal";
import { mapStagesToOptions } from "@/lib/stage-utils";
import type { StageOption } from "@/components/ui/StageDropdown";
import { toast } from "react-toastify";
import { CreateGroupModal } from "./CreateGroupModal";

export interface GroupsContentRef {
    exportExcel: () => void;
    exportCSV: () => void;
    exportData: () => void;
}

export const GroupsContent = forwardRef<GroupsContentRef, { groupModalOpen: boolean; onGroupModalClose: () => void }>(
    function GroupsContent({ groupModalOpen, onGroupModalClose }, ref) {
        const router = useRouter();

        const { data: paginatedLeads, refetch: refetchLeads } = useGetLeadsQuery({
            page: 1,
            limit: 100,
        });

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
        const [searchQuery, setSearchQuery] = useState("");
        const [stages, setStages] = useState<StageOption[]>([]);
        const [leadModalOpen, setLeadModalOpen] = useState(false);
        const [targetGroupId, setTargetGroupId] = useState<string | null>(null);
        const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);

        const { handleStageChange, handleDeleteLead, handleDeleteGroup, handleAddLeadToGroup } = useGroupActions({
            refetch,
            refetchLeads,
            fetchGroupLeads,
            addLeadToGroupOptimistic,
            updateLeadStageOptimistic,
        });

        const exportColumns = useMemo(
            () => [
                { key: "groupName", header: "Group Name" },
                { key: "name", header: "Lead Name" },
                { key: "service", header: "Service" },
                { key: "email", header: "Email" },
                { key: "source", header: "Source" },
                { key: "depositStatus", header: "Deposit" },
                { key: "stage", header: "Stage" },
                { key: "date", header: "Date" },
            ],
            [],
        );

        const buildGroupExportData = useCallback(() => {
            const exportData: Record<string, unknown>[] = [];

            groups.forEach((group) => {
                const groupLeadsList = groupLeads.filter((lead) =>
                    group.leadIds.includes(lead.id)
                );

                if (groupLeadsList.length === 0) {
                    exportData.push({
                        groupName: group.name,
                        name: "",
                        service: "",
                        email: "",
                        source: "",
                        depositStatus: "",
                        stage: "",
                        date: "",
                    });
                } else {
                    groupLeadsList.forEach((lead) => {
                        exportData.push({
                            groupName: group.name,
                            name: lead.name,
                            service: lead.service,
                            email: lead.email,
                            source: lead.source,
                            depositStatus: lead.depositStatus,
                            stage: lead.stage,
                            date: lead.date,
                        });
                    });
                }
            });

            return exportData;
        }, [groups, groupLeads]);

        const { handleExport: exportExcel } = useExportExcel({
            data: buildGroupExportData(),
            columns: exportColumns,
            filename: "groups-export",
        });

        const exportCSV = useCallback(() => {
            const dataToExport = buildGroupExportData();

            if (dataToExport.length === 0) {
                toast.warning('No data to export');
                return;
            }

            const validColumns = exportColumns.filter((col): col is { key: string; header: string } => col != null);

            const headers = validColumns.map(col => `"${col.header}"`).join(',');
            const rows = dataToExport.map(row =>
                validColumns.map(col => {
                    const value = row[col.key];
                    if (value === null || value === undefined) return '""';
                    const stringValue = String(value);
                    return `"${stringValue.replace(/"/g, '""')}"`;
                }).join(',')
            );

            const csvContent = [headers, ...rows].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = 'groups-export.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success(`Exported ${dataToExport.length} rows from ${groups.length} groups`);
        }, [buildGroupExportData, exportColumns, groups.length]);

        const exportData = useCallback(() => {
            exportExcel();
        }, [exportExcel]);

        useImperativeHandle(ref, () => ({
            exportExcel,
            exportCSV,
            exportData,
        }), [exportExcel, exportCSV]);

        useEffect(() => {
            getStages().then((s) => setStages(mapStagesToOptions(s)));
        }, []);

        useEffect(() => {
            if (!groupModalOpen) {
                refetch();
                refetchLeads();
            }
        }, [groupModalOpen, refetch, refetchLeads]);

        useEffect(() => {
            if (groups.length > 0 && !isLoading) {
                const firstGroup = groups[0];
                if (firstGroup) {
                    fetchGroupLeads(firstGroup.id);
                }
            }
        }, [groups, isLoading, fetchGroupLeads]);

        const handleLeadAdded = useCallback(async (leadId: string) => {
            if (!targetGroupId) return;

            const leadData = allLeads.find(l => l.id === leadId);
            const success = await handleAddLeadToGroup(targetGroupId, leadId, leadData);

            if (success) {
                setTargetGroupId(null);
                setLeadModalOpen(false);
            }
        }, [targetGroupId, allLeads, handleAddLeadToGroup]);

        const handleGroupCreated = useCallback(async (newGroup: any) => {
            const optimisticGroup: any = {
                id: newGroup.id || `temp_${Date.now()}`,
                name: newGroup.name,
                description: newGroup.description || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                brevoListId: newGroup.brevoListId || null,
                _count: { leads: 0 },
            };

            addGroupOptimistic(optimisticGroup);
            onGroupModalClose();
            toast.success(`Group "${newGroup.name}" created`);

            try {
                await refetch();
                await refetchLeads();
                if (newGroup.id && !newGroup.id.startsWith('temp_')) {
                    removeOptimisticGroup(optimisticGroup.id);
                }
            } catch (error) {
                console.error('Error syncing groups after creation:', error);
            }
        }, [addGroupOptimistic, removeOptimisticGroup, refetch, refetchLeads, onGroupModalClose]);

        const filteredGroups = groups.filter((g) => g.name.toLowerCase().includes(searchQuery.toLowerCase()));

        if (isLoading) {
            return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-[#0098E8] border-t-transparent rounded-full animate-spin" /></div>;
        }

        return (
            <div className="flex flex-col gap-3 w-full">
                <GroupsHeader
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onExport={() => {
                        // Open export dropdown or handle export
                        exportExcel();
                    }}
                    exportDisabled={groups.length === 0}
                    onAddGroup={() => setCreateGroupModalOpen(true)}
                />
                <GroupsList
                    groups={filteredGroups}
                    leads={groupLeads}
                    stages={stages}
                    onStageChange={handleStageChange}
                    onDelete={handleDeleteLead}
                    onAddLead={(gid: string) => {
                        setTargetGroupId(gid);
                        setLeadModalOpen(true);
                    }}
                    onDeleteGroup={handleDeleteGroup}
                    router={router}
                    onGroupExpand={fetchGroupLeads}
                />
                <CreateGroupModal
                    isOpen={createGroupModalOpen}
                    onClose={() => setCreateGroupModalOpen(false)}
                    selectedLeads={[]}
                    onGroupCreated={(group) => {
                        setCreateGroupModalOpen(false);
                        handleGroupCreated(group);
                    }}
                />
                <AddLeadModal
                    isOpen={leadModalOpen}
                    onClose={() => { setLeadModalOpen(false); setTargetGroupId(null); }}
                    onLeadCreated={handleLeadAdded}
                    stages={stages}
                    title="Add New Member"
                />
            </div>
        );
    }
);