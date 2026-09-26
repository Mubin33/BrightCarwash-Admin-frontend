"use client";

import type { StageOption } from "@/components/ui/StageDropdown";
import { useExportExcel } from "@/hooks/useExportExcel";
import { useGroupActions } from "@/hooks/useGroupActions";
import { useGroupsData } from "@/hooks/useGroupsData";
import { exportToExcel } from "@/lib/excel-export";
import { mapStagesToOptions } from "@/lib/stage-utils";
import {
  useExportGroupLeadsMutation,
  useGetLeadsQuery,
} from "@/services/leads.api";
import { getStages } from "@/services/stage.service";
import { useRouter } from "next/navigation";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { toast } from "react-toastify";
import { AddGroupMemberModal } from "./AddGroupMemberModal";
import { CreateGroupModal } from "./CreateGroupModal";
import { GroupsHeader } from "./GroupsHeader";
import { GroupsList } from "./GroupsList";

export interface GroupsContentRef {
  exportExcel: () => void;
  exportCSV: () => void;
  exportData: () => void;
}

export const GroupsContent = forwardRef<
  GroupsContentRef,
  { groupModalOpen: boolean; onGroupModalClose: () => void }
>(function GroupsContent({ groupModalOpen, onGroupModalClose }, ref) {
  const router = useRouter();

  const { data: paginatedLeads, refetch: refetchLeads } = useGetLeadsQuery({
    page: 1,
    limit: 100,
  });

  const allLeads = paginatedLeads?.data || [];
  const [exportGroupLeads, { isLoading: isExportingGroup }] =
    useExportGroupLeadsMutation();

  const {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalItems,
    totalPages,
    currentLimit,
    groups,
    leads: groupLeads,
    isPageLoading,
    refetch,
    fetchGroupLeads,
    groupLeadPagination,
    addGroupOptimistic,
    removeOptimisticGroup,
    addLeadToGroupOptimistic,
    updateLeadStageOptimistic,
    removeLeadOptimistic,
  } = useGroupsData();

  const [stages, setStages] = useState<StageOption[]>([]);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [targetGroupId, setTargetGroupId] = useState<string | null>(null);
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);

  const {
    handleStageChange,
    handleDeleteLead,
    handleDeleteGroup,
    handleAddLeadToGroup,
  } = useGroupActions({
    refetch,
    refetchLeads,
    fetchGroupLeads,
    addLeadToGroupOptimistic,
    updateLeadStageOptimistic,
    removeLeadOptimistic,
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
        group.leadIds.includes(lead.id),
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
      toast.warning("No data to export");
      return;
    }

    const validColumns = exportColumns.filter(
      (col): col is { key: string; header: string } => col != null,
    );

    const headers = validColumns.map((col) => `"${col.header}"`).join(",");
    const rows = dataToExport.map((row) =>
      validColumns
        .map((col) => {
          const value = row[col.key];
          if (value === null || value === undefined) return '""';
          const stringValue = String(value);
          return `"${stringValue.replace(/"/g, '""')}"`;
        })
        .join(","),
    );

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "groups-export.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(
      `Exported ${dataToExport.length} rows from ${groups.length} groups`,
    );
  }, [buildGroupExportData, exportColumns, groups.length]);

  const handleExportGroup = useCallback(
    async (groupId: string, format: "xlsx" | "csv") => {
      const group = groups.find((g) => g.id === groupId);
      const safeGroupName = (group?.name || "group-leads").replace(
        /[^a-zA-Z0-9_-]/g,
        "_",
      );

      try {
        const result = await exportGroupLeads({ groupId, format }).unwrap();
        if (result.success) {
          toast.success(
            result.message ||
              `Exported ${group?.name || "group"} leads as ${format.toUpperCase()}`,
          );
          return;
        }
      } catch (apiError) {
        console.warn(
          "Backend group export failed, falling back to client-side export:",
          apiError,
        );
      }

      // Fallback: client-side export
      try {
        let leadsToExport = groupLeads.filter((l) =>
          group?.leadIds.includes(l.id),
        );

        if (leadsToExport.length === 0) {
          leadsToExport = await fetchGroupLeads(groupId, 1, 10, true);
        }

        if (!leadsToExport || leadsToExport.length === 0) {
          toast.warning("No leads found in this group to export");
          return;
        }

        const formattedData = leadsToExport.map((lead) => ({
          groupName: group?.name || "Group",
          name: lead.name,
          service: lead.service,
          email: lead.email,
          source: lead.source,
          depositStatus: lead.depositStatus,
          stage: lead.stage,
          date: lead.date,
        }));

        if (format === "xlsx") {
          exportToExcel(formattedData, exportColumns, `${safeGroupName}-leads`);
          toast.success(`Exported ${formattedData.length} leads as Excel`);
        } else {
          const validColumns = exportColumns.filter(
            (col): col is { key: string; header: string } => col != null,
          );
          const headers = validColumns
            .map((col) => `"${col.header}"`)
            .join(",");
          const rows = formattedData.map((row) =>
            validColumns
              .map((col) => {
                const value = (row as any)[col.key];
                if (value === null || value === undefined) return '""';
                const stringValue = String(value);
                return `"${stringValue.replace(/"/g, '""')}"`;
              })
              .join(","),
          );
          const csvContent = [headers, ...rows].join("\n");
          const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
          });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${safeGroupName}-leads.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          toast.success(`Exported ${formattedData.length} leads as CSV`);
        }
      } catch (fallbackError) {
        console.error("Client-side export failed:", fallbackError);
        toast.error("Failed to export group leads");
      }
    },
    [exportGroupLeads, groups, groupLeads, fetchGroupLeads, exportColumns],
  );

  const exportData = useCallback(() => {
    exportExcel();
  }, [exportExcel]);

  useImperativeHandle(
    ref,
    () => ({
      exportExcel,
      exportCSV,
      exportData,
    }),
    [exportExcel, exportCSV],
  );

  useEffect(() => {
    getStages().then((s) => setStages(mapStagesToOptions(s)));
  }, []);

  useEffect(() => {
    if (!groupModalOpen) {
      refetch();
      refetchLeads();
    }
  }, [groupModalOpen, refetch, refetchLeads]);

  // useEffect(() => {
  //   if (groups.length > 0 && !isPageLoading) {
  //     const firstGroup = groups[0];
  //     if (firstGroup) {
  //       fetchGroupLeads(firstGroup.id);
  //     }
  //   }
  // }, [groups, isPageLoading, fetchGroupLeads]);

  const handleLeadAdded = useCallback(
    async (leadId: string) => {
      if (!targetGroupId) return;

      const leadData = allLeads.find((l) => l.id === leadId);
      const success = await handleAddLeadToGroup(
        targetGroupId,
        leadId,
        leadData,
      );

      if (success) {
        setTargetGroupId(null);
        setLeadModalOpen(false);
      }
    },
    [targetGroupId, allLeads, handleAddLeadToGroup],
  );

  const handleGroupCreated = useCallback(
    async (newGroup: any) => {
      const optimisticGroup: any = {
        id: newGroup.id || `temp_${Date.now()}`,
        name: newGroup.name,
        description: newGroup.description || "",
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
        if (newGroup.id && !newGroup.id.startsWith("temp_")) {
          removeOptimisticGroup(optimisticGroup.id);
        }
      } catch (error) {
        console.error("Error syncing groups after creation:", error);
      }
    },
    [
      addGroupOptimistic,
      removeOptimisticGroup,
      refetch,
      refetchLeads,
      onGroupModalClose,
    ],
  );

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (isPageLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-[#0098E8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
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
        groupLeadPagination={groupLeadPagination}
        fetchGroupLeads={fetchGroupLeads}
        onExport={handleExportGroup}
        exportDisabled={isExportingGroup}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isPageLoading={isPageLoading}
        totalItems={totalItems}
        totalPages={totalPages}
        currentLimit={currentLimit}
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
      <AddGroupMemberModal
        isOpen={leadModalOpen}
        onClose={() => {
          setLeadModalOpen(false);
          setTargetGroupId(null);
        }}
        groupId={targetGroupId}
        groupName={groups.find((g) => g.id === targetGroupId)?.name}
        existingLeadIds={
          groups.find((g) => g.id === targetGroupId)?.leadIds || []
        }
        stages={stages}
        onSuccess={async () => {
          if (targetGroupId) {
            await Promise.all([
              fetchGroupLeads(targetGroupId, 1, 10, true),
              refetch(),
              refetchLeads(),
            ]);
          }
        }}
      />
    </div>
  );
});
