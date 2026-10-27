"use client";

import { useState, useEffect, useCallback } from "react";
import {
    getLeadDetail,
    deleteLeadNote,
} from "@/services/lead-detail.service";
import type { LeadDetail, ActivityItem } from "@/types/lead-detail";

export function useLeadDetail(leadId: string) {
    const [lead, setLead] = useState<LeadDetail | null>(null);
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [refresh, setRefresh] = useState(0);

    const fetchData = useCallback(async () => {
        try {
            const l = await getLeadDetail(leadId);
            setLead(l);
            setActivities(l.activities || []);
        } catch (error) {
            console.error("Failed to fetch lead details:", error);
        }
    }, [leadId]);

    // Clean up any legacy sessionStorage keys from prior client-fabricated activities
    useEffect(() => {
        try {
            sessionStorage.removeItem(`leadActivities_${leadId}`);
        } catch (e) {
            console.debug("sessionStorage cleanup skipped:", e);
        }
    }, [leadId]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchData().finally(() => setInitialLoading(false));
    }, [fetchData]);

    useEffect(() => {
        if (refresh > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchData();
        }
    }, [refresh, fetchData]);

    const triggerRefresh = useCallback(() => {
        setRefresh((prev) => prev + 1);
    }, []);

    const deleteNote = useCallback(
        async (noteId: string) => {
            if (!lead) return;

            // Strictly filter by note ID so notes with identical content are not deleted
            const updatedNotes = (lead.notes || []).filter(
                (n) => n.id !== noteId
            );
            setLead((prev) => (prev ? { ...prev, notes: updatedNotes } : prev));

            try {
                await deleteLeadNote(leadId, noteId);
                await fetchData();
            } catch {
                await fetchData();
                throw new Error("Failed to delete note");
            }
        },
        [lead, leadId, fetchData]
    );

    // Kept for backward compatibility; timeline is now purely server-driven per BUG-005
    const addLocalActivity = useCallback((..._args: unknown[]) => {
        void _args;
    }, []);

    return {
        lead,
        activities,
        initialLoading,
        triggerRefresh,
        deleteNote,
        addLocalActivity,
        refetch: fetchData,
    };
}
