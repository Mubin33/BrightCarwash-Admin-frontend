"use client";

import type { StageOption } from "@/components/ui/StageDropdown";
import type { Lead } from "@/types/leads";
import { GroupAccordion } from "./GroupAccordion";
import type { GroupLeadPagination } from "@/hooks/useGroupsData";

interface Group {
  id: string;
  name: string;
  leadIds: string[];
  _count?: { leads: number };
}

interface GroupsListProps {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  isPageLoading?: boolean;
  totalItems?: number;
  totalPages?: number;
  currentLimit?: number;
  groups: Group[];
  leads: Lead[];
  stages: StageOption[];
  onStageChange: (id: string, stageId: string) => void;
  onDelete: (groupId: string, leadId: string, leadName?: string) => void;
  onAddLead: (groupId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  router: { push: (url: string) => void };
  onGroupExpand?: (groupId: string) => void;
  groupLeadPagination: Record<string, GroupLeadPagination>;
  fetchGroupLeads: (
    groupId: string,
    page?: number,
    limit?: number,
    force?: boolean,
  ) => Promise<Lead[]>;

  onExport?: (groupId: string, format: "xlsx" | "csv") => void;
  exportDisabled?: boolean;
}

export function GroupsList({
  currentPage,
  setCurrentPage,
  isPageLoading,
  totalItems = 0,
  totalPages = 1,
  currentLimit = 1,
  groups,
  leads,
  stages,
  onStageChange,
  onDelete,
  onAddLead,
  onDeleteGroup,
  router,
  onGroupExpand,
  groupLeadPagination,
  fetchGroupLeads,
  onExport,
  exportDisabled,
}: GroupsListProps) {
  if (groups.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-[#777980] font-inter text-sm">
        No groups yet. Select leads and create a group.
      </div>
    );
  }

  return (
    <GroupAccordion
      groups={groups}
      leads={leads}
      stages={stages}
      onStageChange={onStageChange}
      onDelete={onDelete}
      router={router}
      onAddLead={onAddLead}
      onDeleteGroup={onDeleteGroup}
      groupLeadPagination={groupLeadPagination}
      fetchGroupLeads={fetchGroupLeads}
      onExport={onExport}
      exportDisabled={exportDisabled}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      isPageLoading={isPageLoading}
      totalItems={totalItems}
      totalPages={totalPages}
      currentLimit={currentLimit}
    />
  );
}
