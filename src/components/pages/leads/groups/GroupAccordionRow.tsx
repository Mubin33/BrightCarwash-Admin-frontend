"use client";

import { ChevronDown, ChevronUp, Plus, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LeadRow } from "./LeadRow";
import type { Lead } from "@/types/leads";
import type { StageOption } from "@/components/ui/StageDropdown";

interface Group {
    id: string;
    name: string;
    leadIds: string[];
    _count?: { leads: number };
}

interface GroupAccordionRowProps {
    group: Group;
    isExpanded: boolean;
    groupLeads: Lead[];
    stages: StageOption[];
    onToggle: (id: string) => void;
    onStageChange: (id: string, stageId: string) => void;
    onDelete: (lead: Lead) => void;
    onAddLead: (groupId: string) => void;
    onDeleteGroup: (groupId: string) => void;
    router: { push: (url: string) => void };
}

export function GroupAccordionRow({
    group,
    isExpanded,
    groupLeads,
    stages,
    onToggle,
    onStageChange,
    onDelete,
    onAddLead,
    onDeleteGroup,
    router,
}: GroupAccordionRowProps) {
    return (
        <tr>
            <td colSpan={8} className="p-0">
                {/* Group header */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-[#E8E8E9] bg-white hover:bg-[#F8FAFB] transition-colors">
                    <div
                        className="flex items-center gap-2 flex-1 cursor-pointer"
                        onClick={() => onToggle(group.id)}
                    >
                        <Users size={16} className="text-[#777980]" />
                        <span className="text-sm font-semibold text-[#1B1B1B] truncate max-w-[400px] block" title={group.name}>{group.name}</span>
                        <span className="text-xs text-[#777980] bg-[#F1F1F1] px-2 py-0.5 rounded-full">
                            {group._count?.leads || 0} Leads
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        {isExpanded && (
                            <>
                                <Button
                                    variant="icon"
                                    onClick={(e) => { e.stopPropagation(); onAddLead(group.id); }}
                                    className="flex h-6 w-6 items-center justify-center rounded text-[#586cc3] bg-gray-300/50 hover:bg-[#586cc3]/10 transition-colors"
                                >
                                    <Plus size={14} />
                                </Button>
                                <Button
                                    variant="icon"
                                    onClick={(e) => { e.stopPropagation(); onDeleteGroup(group.id); }}
                                    className="flex h-6 w-6 items-center justify-center rounded text-[#FF4345] hover:bg-red-50 transition-colors"
                                >
                                    <Trash2 size={14} />
                                </Button>
                            </>
                        )}
                        <Button
                            variant="icon"
                            onClick={(e) => { e.stopPropagation(); onToggle(group.id); }}
                            className="flex h-6 w-6 items-center justify-center rounded text-[#777980] hover:bg-gray-100 transition-colors"
                        >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </Button>
                    </div>
                </div>

                {/* Leads list */}
                {isExpanded && groupLeads.length > 0 && (
                    <table className="w-full">
                        <colgroup>
                            {["20%", "15%", "18%", "12%", "10%", "15%", "8%"].map((w, i) => (
                                <col key={i} style={{ width: w }} />
                            ))}
                        </colgroup>
                        <tbody>
                            {groupLeads.map((lead) => (
                                <LeadRow
                                    key={lead.id}
                                    lead={lead}
                                    stages={stages}
                                    onStageChange={onStageChange}
                                    onDelete={onDelete}
                                    router={router}
                                />
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Empty state */}
                {isExpanded && groupLeads.length === 0 && (
                    <div
                        onClick={() => onAddLead(group.id)}
                        className="mx-4 my-3 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#DFE1E7] py-6 text-[#777980] hover:border-[#B0B3BC] hover:text-[#1B1B1B] transition-colors"
                    >
                        <Plus size={16} className="mb-1" />
                        <span className="text-xs">Add Member</span>
                    </div>
                )}
            </td>
        </tr>
    );
}