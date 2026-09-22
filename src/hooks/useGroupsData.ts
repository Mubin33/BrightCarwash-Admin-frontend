"use client";

import { getAccessToken } from "@/lib/auth-client";
import axiosInstance from "@/lib/axios-instance";
import { useGetLeadGroupsFilterQuery } from "@/services/leads.api";
import type { LeadGroup } from "@/types/campaign";
import type { Lead } from "@/types/leads";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";

function mapApiLeadToLead(apiLead: any): Lead {
  const rawStage = apiLead.stage?.name?.toLowerCase() || "";
  const stageSlug = rawStage ? rawStage.replace(/\s+/g, "_") : "new";

  return {
    id: apiLead.id,
    name: apiLead.name || "",
    email: apiLead.email || "",
    phone: apiLead.phone || "",
    avatar: "/images/avatar-placeholder.png",
    service: apiLead.service || "",
    vehicle: apiLead.vehicle || "",
    source: apiLead.source || "",
    priority: (apiLead.priority as Lead["priority"]) || "MEDIUM",
    deposit: 0,
    depositStatus: (apiLead.deposit_status as Lead["depositStatus"]) || "NONE",
    stage: stageSlug,
    stageId: apiLead.stage_id || "",
    stageIcon: apiLead.stage?.icon ?? null,
    assignedToId: apiLead.assigned_to_id || null,
    notes: apiLead.notes || [],
    date: apiLead.created_at?.split("T")[0] || "",
  };
}

interface GroupWithLeads {
  id: string;
  name: string;
  leadIds: string[];
  _count?: { leads: number };
}

export function useGroupsData() {
  const [groupLeadsMap, setGroupLeadsMap] = useState<Record<string, Lead[]>>(
    {},
  );
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [optimisticGroups, setOptimisticGroups] = useState<LeadGroup[]>([]);
  const [fetchingGroups, setFetchingGroups] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [groupId, setGroupId] = useState<string>("");

  // Groups list
  const {
    data: apiGroupsResponse,
    refetch: refetchGroups,
    isLoading: groupsLoading,
  } = useGetLeadGroupsFilterQuery({
    page: currentPage,
    limit: 5,
    search: searchQuery || undefined,
  });

  const totalItems = apiGroupsResponse?.meta?.totalItems || 0;
  const totalPages = apiGroupsResponse?.meta?.totalPages || 1;
  const currentLimit = 2;
  const isPageLoading = groupsLoading || isLoadingLeads;

  const allGroups = [...(apiGroupsResponse?.groups ?? []), ...optimisticGroups];

  const fetchGroupLeads = useCallback(
    async (groupId: string, force?: boolean) => {
      if (
        !force &&
        (groupLeadsMap[groupId]?.length > 0 || fetchingGroups.has(groupId))
      ) {
        return groupLeadsMap[groupId] || [];
      }

      setFetchingGroups((prev) => new Set(prev).add(groupId));

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

        setGroupLeadsMap((prev) => ({
          ...prev,
          [groupId]: mappedLeads,
        }));

        return mappedLeads;
      } catch (error: any) {
        console.error(`Failed to fetch leads for group ${groupId}:`, error);
        return [];
      } finally {
        setFetchingGroups((prev) => {
          const next = new Set(prev);
          next.delete(groupId);
          return next;
        });
      }
    },
    [groupLeadsMap, fetchingGroups],
  );

  const addGroupOptimistic = useCallback((group: LeadGroup) => {
    setOptimisticGroups((prev) => [...prev, group]);
  }, []);

  const removeOptimisticGroup = useCallback((groupId: string) => {
    setOptimisticGroups((prev) => prev.filter((g) => g.id !== groupId));
  }, []);

  const addLeadToGroupOptimistic = useCallback(
    (groupId: string, lead: Lead) => {
      setGroupLeadsMap((prev) => {
        const currentLeads = prev[groupId] || [];
        if (currentLeads.some((l) => l.id === lead.id)) {
          return prev;
        }
        return {
          ...prev,
          [groupId]: [...currentLeads, lead],
        };
      });
    },
    [],
  );

  const updateLeadStageOptimistic = useCallback(
    (leadId: string, newStage: string) => {
      setGroupLeadsMap((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((groupId) => {
          next[groupId] = next[groupId].map((lead) => {
            if (lead.id === leadId) {
              return { ...lead, stage: newStage };
            }
            return lead;
          });
        });
        return next;
      });
    },
    [],
  );

  // Function to refresh after deleting/disconnecting a lead from a group
  const removeLeadOptimistic = useCallback(
    (groupIdOrLeadId: string, maybeLeadId?: string) => {
      const groupId = maybeLeadId ? groupIdOrLeadId : undefined;
      const leadId = maybeLeadId ? maybeLeadId : groupIdOrLeadId;

      setGroupLeadsMap((prev) => {
        const next = { ...prev };
        if (groupId && next[groupId]) {
          next[groupId] = next[groupId].filter((lead) => lead.id !== leadId);
        } else {
          Object.keys(next).forEach((gid) => {
            next[gid] = next[gid].filter((lead) => lead.id !== leadId);
          });
        }
        return next;
      });
    },
    [],
  );

  const groups: GroupWithLeads[] = allGroups.map((group: LeadGroup) => {
    const currentGroupLeads = groupLeadsMap[group.id];
    return {
      id: group.id,
      name: group.name,
      leadIds: (currentGroupLeads || []).map((l) => l.id),
      _count:
        currentGroupLeads !== undefined
          ? { leads: currentGroupLeads.length }
          : group._count || { leads: 0 },
    };
  });

  const allLeads: Lead[] = Object.values(groupLeadsMap).flat();
  const leads: Lead[] = Array.from(
    new Map(allLeads.map((lead) => [lead.id, lead])).values(),
  );

  return {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalItems,
    totalPages,
    currentLimit,
    groups,
    setGroupId,
    leads,
    groupLeads: leads,
    isPageLoading,
    isLoading: isPageLoading,
    refetch: refetchGroups,
    fetchGroupLeads,
    addGroupOptimistic,
    removeOptimisticGroup,
    addLeadToGroupOptimistic,
    updateLeadStageOptimistic,
    removeLeadOptimistic,
  };
}
