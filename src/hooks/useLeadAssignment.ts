"use client";

import { useCallback } from "react";
import { assignLeadToMember } from "@/services/lead-detail.service";
import { toast } from "react-toastify";
import type { LeadDetail } from "@/types/lead-detail";

export function useLeadAssignment(
    leadId: string,
    _currentLead: LeadDetail | null,
    triggerRefresh: () => void
) {
    const handleAssign = useCallback(
        async (memberId: string | null) => {
            try {
                await assignLeadToMember(leadId, memberId);
                toast.success(memberId ? "Member assigned successfully" : "Member unassigned successfully");
                triggerRefresh();
            } catch (err) {
                const error = err as Error;
                toast.error(error.message || "Failed to assign member");
                throw error;
            }
        },
        [leadId, triggerRefresh]
    );

    return { handleAssign };
}
