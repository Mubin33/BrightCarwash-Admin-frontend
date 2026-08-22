"use client";

import Image from "next/image";
import { StageDropdown } from "@/components/ui/StageDropdown";
import { ActionsDropdown } from "@/components/ui/ActionsDropdown";
import type { Lead } from "@/types/leads";
import type { StageOption } from "@/components/ui/StageDropdown";

const depositStatusStyles: Record<string, string> = {
    PAID: "text-[#006F1F] border-[#E8E8E9] bg-white",
    PENDING: "text-[#FFAF00] border-[#E8E8E9] bg-white",
    REFUNDED: "text-[#FF4345] border-[#E8E8E9] bg-white",
    NONE: "text-[#777980] border-[#E8E8E9] bg-white",
};

interface LeadRowProps {
    lead: Lead;
    stages: StageOption[];
    onStageChange: (id: string, stageId: string) => void;
    onDelete: (lead: Lead) => void;
    router: { push: (url: string) => void };
}

export function LeadRow({ lead, stages, onStageChange, onDelete, router }: LeadRowProps) {
    const stageOption = stages.find(s => s.stageId === lead.stageId);
    const currentStageValue = stageOption ? stageOption.value : lead.stage;

    return (
        <tr className="border-t border-[#E8E8E9] bg-white hover:bg-[#F8FAFB] transition-colors">
            <td className="py-2.5 px-4 border-r border-[#E8E8E9]">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden border border-white shrink-0">
                        <Image
                            src={lead.avatar}
                            alt={lead.name}
                            width={24}
                            height={24}
                            className="object-cover"
                        />
                    </div>
                    <span className="text-[#1B1B1B] font-inter text-sm truncate max-w-[120px]">
                        {lead.name}
                    </span>
                </div>
            </td>
            <td className="py-2.5 px-4 border-r border-[#E8E8E9] text-[#1B1B1B] font-inter text-sm truncate max-w-[120px]">
                {lead.service}
            </td>
            <td className="py-2.5 px-4 border-r border-[#E8E8E9] text-[#1B1B1B] font-inter text-sm truncate max-w-[180px]">
                {lead.email}
            </td>
            <td className="py-2.5 px-4 border-r border-[#E8E8E9] text-[#1B1B1B] font-inter text-sm truncate max-w-[120px]">
                {lead.source}
            </td>
            <td className="py-2.5 px-4 border-r border-[#E8E8E9]">
                <span className={`inline-flex py-1.5 px-2 justify-center items-center gap-1 rounded border text-xs capitalize ${depositStatusStyles[lead.depositStatus] || depositStatusStyles.NONE}`}>
                    {lead.depositStatus}
                </span>
            </td>
            <td className="py-2.5 px-4 border-r border-[#E8E8E9]">
                <StageDropdown
                    currentStage={currentStageValue}
                    stages={stages}
                    onSelect={(stageId) => onStageChange(lead.id, stageId)}
                />
            </td>
            <td className="py-2.5 px-4 border-r border-[#E8E8E9] text-[#777980] font-inter text-sm">
                {lead.date}
            </td>
            <td className="py-2.5 px-4">
                <ActionsDropdown
                    items={[
                        { label: "View Lead", onClick: () => router.push(`/leads/${lead.id}`) },
                        { label: "Delete", onClick: () => onDelete(lead), variant: "danger" as const },
                    ]}
                />
            </td>
        </tr>
    );
}