"use client";

import {
  LeadsTable,
  type LeadsTableHandle,
} from "@/components/pages/leads/LeadsTable";
import { CreateGroupModal } from "@/components/pages/leads/groups/CreateGroupModal";
import { AddLeadModal } from "@/components/pages/leads/kanban/AddLeadModal";
import { useLeadsContent } from "@/hooks/useLeadsContent";
import { useRef, useState } from "react";
import { LeadsContentHeader } from "./LeadsContentHeader";

export function LeadsContent() {
  const [listLimit, setListLimit] = useState(10);
  const [kanbanLimit, setKanbanLimit] = useState(100);
  const tableRef = useRef<LeadsTableHandle>(null);
  const {
    modalOpen,
    setModalOpen,
    groupModalOpen,
    setGroupModalOpen,
    viewMode,
    setViewMode,
    leadType,
    setLeadType,
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
  } = useLeadsContent();

  const handleExportExcel = () => {
    tableRef.current?.exportExcel();
    setIsExportOpen(false);
  };

  const handleExportCSV = () => {
    tableRef.current?.exportCSV();
    setIsExportOpen(false);
  };

  return (
    <div className="w-full h-full flex flex-col gap-3 sm:gap-4 p-3 sm:p-4">
      <LeadsContentHeader
        selectedCount={selectedCount}
        isExportOpen={isExportOpen}
        setIsExportOpen={setIsExportOpen}
        exportRef={exportRef}
        handleExportExcel={handleExportExcel}
        handleExportCSV={handleExportCSV}
        handleNewGroupClick={handleNewGroupClick}
        setModalOpen={setModalOpen}
        viewMode={viewMode}
        setViewMode={setViewMode}
        leadType={leadType}
        setLeadType={setLeadType}
      />

      <LeadsTable
        ref={tableRef}
        viewMode={viewMode}
        onSelectionChange={handleSelectionChange}
        leadType={leadType}
        listLimit={listLimit}
        setListLimit={setListLimit}
        kanbanLimit={kanbanLimit}
        setKanbanLimit={setKanbanLimit}
      />

      <AddLeadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        stages={stages}
        setStages={setStages}
      />

      <CreateGroupModal
        isOpen={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        selectedLeads={selectedLeads}
        onGroupCreated={() => {
          setGroupModalOpen(false);
          setSelectedLeads([]);
        }}
      />
    </div>
  );
}
