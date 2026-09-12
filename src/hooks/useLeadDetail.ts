"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
    getLeadDetail,
    getLeadActivities,
    deleteLeadNote,
} from "@/services/lead-detail.service";
import type { LeadDetail, ActivityItem } from "@/types/lead-detail";

const LOCAL_ACTIVITIES_KEY = (leadId: string) => `leadActivities_${leadId}`;

export function useLeadDetail(leadId: string) {
    const [lead, setLead] = useState<LeadDetail | null>(null);
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [refresh, setRefresh] = useState(0);

    // Load local activities from sessionStorage
    const loadLocalActivities = useCallback((): ActivityItem[] => {
        try {
            const stored = sessionStorage.getItem(LOCAL_ACTIVITIES_KEY(leadId));
            if (stored) {
                return JSON.parse(stored);
            }
        } catch { }
        return [];
    }, [leadId]);

    // Save local activities to sessionStorage
    const saveLocalActivities = useCallback((activities: ActivityItem[]) => {
        try {
            sessionStorage.setItem(LOCAL_ACTIVITIES_KEY(leadId), JSON.stringify(activities));
        } catch { }
    }, [leadId]);

    const fetchData = useCallback(async () => {
        const [l, a] = await Promise.all([
            getLeadDetail(leadId),
            getLeadActivities(leadId),
        ]);


        const localActivities = loadLocalActivities();


        const merged = [...a];
        localActivities.forEach((localAct) => {
            if (!merged.some((act) => act.id === localAct.id)) {
                merged.push(localAct);
            }
        });

        merged.sort((x, y) => new Date(y.date).getTime() - new Date(x.date).getTime());
        setActivities(merged);
        setLead(l);
    }, [leadId, loadLocalActivities]);

    useEffect(() => {
        fetchData().finally(() => setInitialLoading(false));
    }, [fetchData]);

    useEffect(() => {
        if (refresh > 0) {
            fetchData();
        }
    }, [refresh, fetchData]);

    const triggerRefresh = useCallback(() => {
        setRefresh((prev) => prev + 1);
    }, []);

    const deleteNote = useCallback(
        async (noteContent: string) => {
            if (!lead) return;

            const updatedNotes = lead.notes.filter((n) => n.content !== noteContent);
            setLead({ ...lead, notes: updatedNotes });

            try {
                await deleteLeadNote(leadId, noteContent);
            } catch {
                await fetchData();
                throw new Error("Failed to delete note");
            }
        },
        [lead, leadId, fetchData]
    );

    const addLocalActivity = useCallback((activity: ActivityItem) => {
        const currentLocal = loadLocalActivities();
        const updated = [activity, ...currentLocal];
        const unique = updated.filter(
            (act, index, self) => index === self.findIndex((a) => a.id === act.id)
        );
        saveLocalActivities(unique);
        setActivities((prev) => {
            const merged = [activity, ...prev];
            merged.sort((x, y) => new Date(y.date).getTime() - new Date(x.date).getTime());
            return merged;
        });
    }, [loadLocalActivities, saveLocalActivities]);

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