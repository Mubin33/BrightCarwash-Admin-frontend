import type { StageOption } from "@/components/ui/StageDropdown";
import { useLeadSelection } from "@/hooks/useLeadSelection";
import { mapStagesToOptions } from "@/lib/stage-utils";
import {
  useDeleteLeadMutation,
  useGetLeadFilterOptionsQuery,
  useGetLeadsQuery,
  useUpdateLeadPriorityMutation,
  useUpdateLeadStageMutation,
  useReorderLeadMutation,
} from "@/services/leads.api";
import { getStages } from "@/services/stage.service";
import type { Lead } from "@/types/leads";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

const ITEMS_PER_PAGE = 10;

export function useLeadsData(
  externalSearch?: string,
  leadType: "all" | "mine" = "all",
  kanbanLimit?: number,
) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [depositFilter, setDepositFilter] = useState("");
  const [searchSubmitted, setSearchSubmitted] = useState(false);

  const isAssignedToMe = leadType === "mine";
  const limit = kanbanLimit || ITEMS_PER_PAGE;

  const [prevLeadType, setPrevLeadType] = useState(leadType);
  if (leadType !== prevLeadType) {
    setPrevLeadType(leadType);
    setCurrentPage(1);
  }

  const {
    data: paginatedData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetLeadsQuery(
    {
      page: currentPage,
      limit,
      search: searchSubmitted
        ? searchTerm || externalSearch || undefined
        : undefined,
      source: sourceFilter || undefined,
      priority: priorityFilter || undefined,
      depositStatus: depositFilter || undefined,
      isAssignedToMe,
    },
    {
      refetchOnMountOrArgChange: true,
    },
  );

  const [updateStage] = useUpdateLeadStageMutation();
  const [reorderLeadMutation] = useReorderLeadMutation();
  const [updatePriority] = useUpdateLeadPriorityMutation();
  const [deleteLead] = useDeleteLeadMutation();
  const { data: leadFilterOptions } = useGetLeadFilterOptionsQuery();

  const { selectedIds, handleSelectRow, handleSelectAll } = useLeadSelection();
  const [stages, setStages] = useState<StageOption[]>([]);
  const [localLeads, setLocalLeads] = useState<Lead[]>([]);

  const [prevPaginatedData, setPrevPaginatedData] = useState(paginatedData?.data);
  if (paginatedData?.data !== prevPaginatedData) {
    setPrevPaginatedData(paginatedData?.data);
    setLocalLeads(paginatedData?.data || []);
  }

  // Always refetch on initial mount to guarantee fresh state after navigation
  useEffect(() => {
    refetch();
  }, [refetch]);

  const leads = useMemo(
    () =>
      localLeads.length > 0 || isLoading || isFetching
        ? localLeads
        : paginatedData?.data || [],
    [localLeads, isLoading, isFetching, paginatedData?.data]
  );

  const totalItems = paginatedData?.total || 0;
  const totalPages = paginatedData?.totalPages || 1;
  const isPageLoading = isLoading || isFetching;

  const uniqueSources = useMemo(
    () => [...new Set(leads.map((l) => l.source))],
    [leads],
  );

  const refreshStages = useCallback(async () => {
    setStages(mapStagesToOptions(await getStages()));
  }, []);

  useEffect(() => {
    getStages().then((s) => setStages(mapStagesToOptions(s)));
  }, []);

  useEffect(() => {
    refetch();
  }, [
    currentPage,
    searchSubmitted,
    searchTerm,
    externalSearch,
    sourceFilter,
    priorityFilter,
    depositFilter,
    isAssignedToMe,
    limit,
    refetch,
  ]);

  const handleSearchSubmit = useCallback(() => {
    setSearchSubmitted(true);
    setCurrentPage(1);
  }, []);

    const handleReorderLead = useCallback(
    async (
      leadId: string,
      targetStageId: string,
      prevRank: string | null,
      nextRank: string | null,
      optimisticRank: string,
    ) => {
      const previousLeads = [...localLeads];

      const targetLower = targetStageId.toLowerCase().trim();
      const matchedOption = stages.find(
        (s) =>
          s.stageId === targetStageId ||
          s.label.toLowerCase().trim() === targetLower ||
          s.value.toLowerCase().trim() === targetLower ||
          s.label.toLowerCase().replace(/[-_\s]/g, "") ===
            targetLower.replace(/[-_\s]/g, ""),
      );

      const targetSlug =
        matchedOption?.value ||
        (targetLower === "new lead" ? "new" : targetLower.replace(/\s+/g, "_"));

      const finalStageId = matchedOption?.stageId || targetStageId;

      setLocalLeads((prev) =>
        prev.map((lead) => {
          if (lead.id === leadId) {
            return {
              ...lead,
              stage: targetSlug,
              stageId: finalStageId,
              stageIcon:
                matchedOption?.icon !== undefined
                  ? matchedOption.icon
                  : lead.stageIcon,
              rank: optimisticRank,
            };
          }
          return lead;
        }),
      );

      try {
        const res = await reorderLeadMutation({
          leadId,
          target_stage_id: finalStageId,
          prev_rank: prevRank,
          next_rank: nextRank,
        }).unwrap();

        if (res?.rank) {
          setLocalLeads((prev) =>
            prev.map((l) =>
              l.id === leadId
                ? {
                    ...l,
                    rank: res.rank,
                    stageId: res.stage_id || l.stageId,
                  }
                : l,
            ),
          );
        }
        return res;
      } catch (error) {
        setLocalLeads(previousLeads);
        throw error;
      }
    },
    [localLeads, stages, reorderLeadMutation],
  );

  const handleStageChange = useCallback(
    async (id: string, stageName: string) => {
      // Find matching stage option to retrieve slug, icon, and stageId
      const targetLower = stageName.toLowerCase().trim();
      const matchedOption = stages.find(
        (s) =>
          s.label.toLowerCase().trim() === targetLower ||
          s.value.toLowerCase().trim() === targetLower ||
          s.stageId === stageName ||
          s.label.toLowerCase().replace(/[-_\s]/g, "") ===
            targetLower.replace(/[-_\s]/g, ""),
      );

      const targetSlug =
        matchedOption?.value ||
        (targetLower === "new lead" ? "new" : targetLower.replace(/\s+/g, "_"));

      // Snapshot previous leads for rollback on error
      const previousLeads = [...localLeads];

      // 1. Optimistically update local leads immediately
      setLocalLeads((prev) =>
        prev.map((lead) => {
          if (lead.id === id) {
            return {
              ...lead,
              stage: targetSlug,
              stageId: matchedOption?.stageId || lead.stageId,
              stageIcon:
                matchedOption?.icon !== undefined
                  ? matchedOption.icon
                  : lead.stageIcon,
            };
          }
          return lead;
        }),
      );

      // 2. Perform backend update and sync
      try {
        await updateStage({ id, stageName }).unwrap();
        toast.success("Stage updated");
        await refetch();
      } catch {
        // Rollback on failure
        setLocalLeads(previousLeads);
        toast.error("Failed to update stage");
      }
    },
    [stages, localLeads, updateStage, refetch],
  );

  const handlePriorityChange = useCallback(
    async (id: string, priority: string) => {
      const previousLeads = [...localLeads];

      // Optimistic update
      setLocalLeads((prev) =>
        prev.map((lead) => {
          if (lead.id === id) {
            return {
              ...lead,
              priority: priority as Lead["priority"],
            };
          }
          return lead;
        }),
      );

      try {
        await updatePriority({ id, priority }).unwrap();
        toast.success("Priority updated");
        await refetch();
      } catch {
        setLocalLeads(previousLeads);
        toast.error("Failed to update priority");
      }
    },
    [localLeads, updatePriority, refetch],
  );

  const handleDelete = useCallback(
    async (lead: Lead) => {
      if (!confirm(`Delete lead "${lead.name}"?`)) return;

      const previousLeads = [...localLeads];

      // Optimistic remove
      setLocalLeads((prev) => prev.filter((l) => l.id !== lead.id));

      try {
        await deleteLead(lead.id).unwrap();
        toast.success("Lead deleted");
        await refetch();
      } catch {
        setLocalLeads(previousLeads);
        toast.error("Failed to delete lead");
      }
    },
    [localLeads, deleteLead, refetch],
  );

  const sourceFilters = useMemo(
    () => leadFilterOptions?.sources?.map((s) => s.source) || uniqueSources,
    [leadFilterOptions, uniqueSources],
  );

  const uniquePriorities = useMemo(
    () =>
      leadFilterOptions?.priorities?.map((p) => p.priority) || [
        "LOW",
        "MEDIUM",
        "HIGH",
        "URGENT",
      ],
    [leadFilterOptions],
  );

  return {
    currentPage,
    setCurrentPage,
    searchTerm,
    setSearchTerm,
    sourceFilter,
    setSourceFilter,
    priorityFilter,
    setPriorityFilter,
    depositFilter,
    setDepositFilter,
    leads,
    totalItems,
    totalPages,
    isPageLoading,
    selectedIds,
    stages,
    setStages,
    uniqueSources,
    sourceFilters,
    uniquePriorities,
    paginatedData,
    isLoading,
    error,
    refreshStages,
    handleSearchSubmit,
    handleStageChange,
    handleReorderLead,
    handlePriorityChange,
    handleDelete,
    handleSelectRow,
    handleSelectAll,
    refetch,
    leadFilterOptions,
  };
}
