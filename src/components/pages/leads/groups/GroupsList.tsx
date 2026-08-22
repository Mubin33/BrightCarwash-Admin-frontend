"use client";

import { GroupAccordion } from "./GroupAccordion";
import type { Lead } from "@/types/leads";
import type { StageOption } from "@/components/ui/StageDropdown";

interface Group {
    id: string;
    name: string;
    leadIds: string[];
    _count?: { leads: number };
}

interface GroupsListProps {
    groups: Group[];
    leads: Lead[];
    stages: StageOption[];
    onStageChange: (id: string, stageId: string) => void;
    onDelete: (lead: Lead) => void;
    onAddLead: (groupId: string) => void;
    onDeleteGroup: (groupId: string) => void;
    router: { push: (url: string) => void };
    onGroupExpand?: (groupId: string) => void;
}

export function GroupsList({
    groups,
    leads,
    stages,
    onStageChange,
    onDelete,
    onAddLead,
    onDeleteGroup,
    router,
    onGroupExpand,
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
            onGroupExpand={onGroupExpand}
        />
    );
}