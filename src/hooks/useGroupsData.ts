"use client";

import { useState, useCallback, useEffect } from "react";
import { useGetLeadGroupsQuery } from "@/services/leads.api";
import { getAccessToken } from "@/lib/auth-client";
import { APP_CONFIG } from "@/configs/app.config";
import type { LeadGroup } from "@/types/campaign";
import type { Lead } from "@/types/leads";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axios-instance";

function mapApiLeadToLead(apiLead: any): Lead {
    const rawStage = apiLead.stage?.name?.toLowerCase() || "";
    const stageSlug = rawStage ? rawStage.replace(/\s+/g, "_") : "new";

    return {
        id: apiLead.id,
        name: apiLead.name || '',
        email: apiLead.email || '',
        phone: apiLead.phone || '',
        avatar: '/images/avatar-placeholder.png',
        service: apiLead.service || '',
        vehicle: apiLead.vehicle || '',
        source: apiLead.source || '',
        priority: (apiLead.priority as Lead['priority']) || 'MEDIUM',
        deposit: 0,
        depositStatus: (apiLead.deposit_status as Lead['depositStatus']) || 'NONE',
        stage: stageSlug,
        stageId: apiLead.stage_id || '',
        assignedToId: apiLead.assigned_to_id || null,
        notes: apiLead.notes || [],
        date: apiLead.created_at?.split('T')[0] || '',
    };
}

interface GroupWithLeads {
    id: string;
    name: string;
    leadIds: string[];
    _count?: { leads: number };
}

export function useGroupsData() {
    const { data: apiGroups = [], refetch: refetchGroups, isLoading: groupsLoading } = useGetLeadGroupsQuery({
        limit: 100
    });
    const [groupLeadsMap, setGroupLeadsMap] = useState<Record<string, Lead[]>>({});
    const [isLoadingLeads, setIsLoadingLeads] = useState(false);
    const [optimisticGroups, setOptimisticGroups] = useState<LeadGroup[]>([]);
    const [fetchingGroups, setFetchingGroups] = useState<Set<string>>(new Set());

    const allGroups = [...apiGroups, ...optimisticGroups];

    const fetchGroupLeads = useCallback(async (groupId: string, force?: boolean) => {
        if (!force && (groupLeadsMap[groupId]?.length > 0 || fetchingGroups.has(groupId))) {
            return groupLeadsMap[groupId] || [];
        }

        setFetchingGroups(prev => new Set(prev).add(groupId));

        try {
            const token = getAccessToken();
            if (!token) {
                toast.error("Please login");
                return [];
            }

            const url = `/admin/lead-groups/${groupId}/leads?page=1&limit=100`;
            const res = await axiosInstance.get(url);
            const leadsData = res.data?.data?.leads || [];
            const mappedLeads = leadsData.map(mapApiLeadToLead);

            setGroupLeadsMap(prev => ({
                ...prev,
                [groupId]: mappedLeads,
            }));

            return mappedLeads;
        } catch (error: any) {
            console.error(`Failed to fetch leads for group ${groupId}:`, error);
            return [];
        } finally {
            setFetchingGroups(prev => {
                const next = new Set(prev);
                next.delete(groupId);
                return next;
            });
        }
    }, [groupLeadsMap, fetchingGroups]);

    const addGroupOptimistic = useCallback((group: LeadGroup) => {
        setOptimisticGroups(prev => [...prev, group]);
    }, []);

    const removeOptimisticGroup = useCallback((groupId: string) => {
        setOptimisticGroups(prev => prev.filter(g => g.id !== groupId));
    }, []);

    const addLeadToGroupOptimistic = useCallback((groupId: string, lead: Lead) => {
        setGroupLeadsMap(prev => {
            const currentLeads = prev[groupId] || [];
            if (currentLeads.some(l => l.id === lead.id)) {
                return prev;
            }
            return {
                ...prev,
                [groupId]: [...currentLeads, lead],
            };
        });
    }, []);

    const updateLeadStageOptimistic = useCallback((leadId: string, newStage: string) => {
        setGroupLeadsMap(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(groupId => {
                next[groupId] = next[groupId].map(lead => {
                    if (lead.id === leadId) {
                        return { ...lead, stage: newStage };
                    }
                    return lead;
                });
            });
            return next;
        });
    }, []);

    const groups: GroupWithLeads[] = allGroups.map((group: LeadGroup) => ({
        id: group.id,
        name: group.name,
        leadIds: (groupLeadsMap[group.id] || []).map((l) => l.id),
        _count: group._count || { leads: 0 },
    }));

    const allLeads: Lead[] = Object.values(groupLeadsMap).flat();
    const leads: Lead[] = Array.from(
        new Map(allLeads.map((lead) => [lead.id, lead])).values()
    );

    return {
        groups,
        leads,
        groupLeads: leads,
        isLoading: groupsLoading || isLoadingLeads,
        refetch: refetchGroups,
        fetchGroupLeads,
        addGroupOptimistic,
        removeOptimisticGroup,
        addLeadToGroupOptimistic,
        updateLeadStageOptimistic,
    };
}