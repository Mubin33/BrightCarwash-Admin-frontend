"use client";

import { useCallback } from "react";
import { assignLeadToMember } from "@/services/lead-detail.service";
import { toast } from "react-toastify";
import type { LeadDetail, ActivityItem } from "@/types/lead-detail";

export function useLeadAssignment(
    leadId: string,
    currentLead: LeadDetail | null,
    addLocalActivity: (activity: ActivityItem) => void,
    triggerRefresh: () => void
) {
    const handleAssign = useCallback(
        async (memberId: string | null, memberName: string | null) => {
            try {
                await assignLeadToMember(leadId, memberId);
                toast.success(memberId ? "Member assigned successfully" : "Member unassigned successfully");

                const now = new Date();
                const dateStr = now.toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                });
                const displayName = memberName || "a team member";

                const newActivity: ActivityItem = {
                    id: `local_${Date.now()}`,
                    type: "staff",
                    title: memberId ? "Lead assigned" : "Lead unassigned",
                    subtitle: memberId ? `to ${displayName}` : undefined,
                    user: "You",
                    date: dateStr,
                };
                addLocalActivity(newActivity);
                triggerRefresh();
            } catch (error: any) {
                toast.error(error.message || "Failed to assign member");
                throw error;
            }
        },
        [leadId, addLocalActivity, triggerRefresh]
    );

    return { handleAssign };
}