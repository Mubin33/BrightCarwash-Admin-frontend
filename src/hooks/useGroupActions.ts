"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useUpdateLeadStageMutation, useDisconnectLeadsFromGroupMutation } from "@/services/leads.api";
import { getAccessToken } from "@/lib/auth-client";
import { APP_CONFIG } from "@/configs/app.config";
import type { Lead } from "@/types/leads";

export function useGroupActions({
    refetch,
    refetchLeads,
    fetchGroupLeads,
    addLeadToGroupOptimistic,
    updateLeadStageOptimistic,
    removeLeadOptimistic,
}: any) {
    const router = useRouter();
    const [updateStage] = useUpdateLeadStageMutation();
    const [disconnectLeads] = useDisconnectLeadsFromGroupMutation();

    const handleStageChange = useCallback(async (id: string, stageName: string) => {
        updateLeadStageOptimistic(id, stageName);

        try {
            await updateStage({ id, stageName }).unwrap();
            toast.success("Stage updated");
            await refetchLeads();
        } catch {
            toast.error("Failed to update stage");
            await refetchLeads();
        }
    }, [updateStage, refetchLeads, updateLeadStageOptimistic]);

    const handleDeleteLead = useCallback(async (groupIdOrLead: string | Lead, leadId?: string, leadName?: string) => {
        const actualGroupId = typeof groupIdOrLead === 'string' ? groupIdOrLead : '';
        const actualLeadId = leadId || (typeof groupIdOrLead === 'object' ? (groupIdOrLead as Lead).id : '');
        const actualLeadName = leadName || (typeof groupIdOrLead === 'object' ? (groupIdOrLead as Lead).name : '');

        if (!actualGroupId || !actualLeadId) return;

        // Optimistically remove from group list in UI immediately
        removeLeadOptimistic?.(actualGroupId, actualLeadId);

        try {
            await disconnectLeads({ groupId: actualGroupId, leadIds: [actualLeadId] }).unwrap();
            toast.success(actualLeadName ? `${actualLeadName} removed from group` : "Lead removed from group");
            await Promise.all([
                refetch(),
                fetchGroupLeads(actualGroupId, true),
            ]);
        } catch {
            toast.error("Failed to remove lead from group");
            await fetchGroupLeads(actualGroupId, true);
        }
    }, [disconnectLeads, removeLeadOptimistic, refetch, fetchGroupLeads]);

    const handleDeleteGroup = useCallback(async (groupId: string) => {
        try {
            const token = getAccessToken();
            const res = await fetch(`${APP_CONFIG.API_BASE_URL}/admin/lead-groups/${groupId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Failed");
            toast.success("Group deleted");
            await refetch();
        } catch {
            toast.error("Failed to delete group");
        }
    }, [refetch]);

    const handleAddLeadToGroup = useCallback(async (groupId: string, leadId: string, leadData?: Lead) => {
        try {
            const token = getAccessToken();
            if (!token) {
                toast.error("Please login");
                return false;
            }

            const res = await fetch(`${APP_CONFIG.API_BASE_URL}/admin/lead-groups/connect-leads`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ groupId, leadIds: [leadId] }),
            });

            if (!res.ok) throw new Error("Failed");

            toast.success("Lead added to group");

            await Promise.all([
                fetchGroupLeads(groupId, true),
                refetch(),
                refetchLeads()
            ]);

            return true;
        } catch {
            toast.error("Failed to add lead to group");
            await fetchGroupLeads(groupId, true);
            return false;
        }
    }, [refetch, refetchLeads, fetchGroupLeads]);

    return {
        router,
        handleStageChange,
        handleDeleteLead,
        handleRemoveLeadFromGroup: handleDeleteLead,
        handleDeleteGroup,
        handleAddLeadToGroup,
    };
}