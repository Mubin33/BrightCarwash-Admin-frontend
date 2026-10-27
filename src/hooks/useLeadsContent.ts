"use client";

import type { StageOption } from "@/components/ui/StageDropdown";
import { getDefaultLeadView, hasPermission, PERMISSIONS } from "@/lib/permissions";
import { mapStagesToOptions } from "@/lib/stage-utils";
import { useAppSelector } from "@/lib/store";
import { getStages } from "@/services/stage.service";
import { useCallback, useEffect, useRef, useState } from "react";

export function useLeadsContent() {
  const user = useAppSelector((state) => state.auth.user);
  const [modalOpen, setModalOpen] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [leadType, setLeadType] = useState<"all" | "mine">(() => getDefaultLeadView(user));
  const [selectedCount, setSelectedCount] = useState(0);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [stages, setStages] = useState<StageOption[]>([]);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Synchronize default lead view if user profile is loaded after initial render
  useEffect(() => {
    if (user) {
      const preferred = getDefaultLeadView(user);
      if (preferred === "mine" && leadType === "all") {
        setLeadType("mine");
      }
    }
  }, [user, leadType]);

  const handleSetLeadType = useCallback(
    (type: "all" | "mine") => {
      if (
        type === "all" &&
        !hasPermission(user, PERMISSIONS.lead.view_all)
      ) {
        return;
      }
      setLeadType(type);
    },
    [user],
  );

  useEffect(() => {
    getStages().then((s) => setStages(mapStagesToOptions(s)));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        exportRef.current &&
        !exportRef.current.contains(event.target as Node)
      ) {
        setIsExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectionChange = useCallback((count: number, ids: string[]) => {
    setSelectedCount(count);
    setSelectedLeads(ids);
  }, []);

  const handleNewGroupClick = useCallback(() => setGroupModalOpen(true), []);

  return {
    modalOpen,
    setModalOpen,
    groupModalOpen,
    setGroupModalOpen,
    viewMode,
    setViewMode,
    leadType,
    setLeadType: handleSetLeadType,
    selectedCount,
    selectedLeads,
    setSelectedLeads,
    stages,
    setStages,
    isExportOpen,
    setIsExportOpen,
    exportRef,
    handleSelectionChange,
    handleNewGroupClick,
  };
}
