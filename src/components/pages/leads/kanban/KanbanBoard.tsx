"use client";

import { KanbanColumn } from "@/components/pages/leads/kanban/KanbanColumn";
import type { StageOption } from "@/components/ui/StageDropdown";
import { getDefaultStageIcon } from "@/lib/stage-utils";
import type { Lead } from "@/types/leads";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { useCallback, useRef } from "react";

interface KanbanBoardProps {
  leads: Lead[];
  stages: StageOption[];
  setStages: (stages: StageOption[]) => void;
  onStageChange: (id: string, stageId: string) => void;
  onDeleteLead: (lead: Lead) => void;
  onStageDeleted: () => void;
}

function matchLeadToStage(leadStage: string | undefined, stage: StageOption): boolean {
  if (!leadStage) return false;
  const targetLower = leadStage.toLowerCase().trim();
  const valLower = stage.value?.toLowerCase().trim() || "";
  const labelLower = stage.label?.toLowerCase().trim() || "";
  const stageId = stage.stageId || "";

  if (valLower === targetLower || labelLower === targetLower || stageId === leadStage) {
    return true;
  }

  const normTarget = targetLower.replace(/[-_\s]/g, "");
  const normVal = valLower.replace(/[-_\s]/g, "");
  const normLabel = labelLower.replace(/[-_\s]/g, "");

  if (normTarget === normVal || normTarget === normLabel) {
    return true;
  }

  if (
    (targetLower === "new" && (normVal.includes("new") || normLabel.includes("new"))) ||
    (normTarget.includes("new") && valLower === "new")
  ) {
    return true;
  }

  return false;
}

export function KanbanBoard({
  leads,
  stages,
  setStages,
  onStageChange,
  onDeleteLead,
  onStageDeleted,
}: KanbanBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);

  const getLeadsByStage = (stage: StageOption): Lead[] =>
    leads.filter((l) => matchLeadToStage(l.stage, stage) || l.stageId === stage.stageId);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const targetDroppableId = destination.droppableId;
    const lead = leads.find((l) => l.id === draggableId);
    if (!lead) return;

    const targetStageOption = stages.find(
      (s) => s.value === targetDroppableId || s.stageId === targetDroppableId || s.label === targetDroppableId
    );

    if (targetStageOption && matchLeadToStage(lead.stage, targetStageOption)) {
      return;
    }

    onStageChange(draggableId, targetStageOption?.label || targetDroppableId);
  };

  const handleWheel = useCallback((e: React.WheelEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest(".adm-kanban-scroll")) return;
    if (!boardRef.current) return;
    e.preventDefault();
    boardRef.current.scrollLeft += e.deltaY;
  }, []);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div
        ref={boardRef}
        onWheel={handleWheel}
        className="flex gap-4 overflow-x-auto pb-4 adm-kanban-board h-full"
      >
        {stages.map((stage) => {
          const icon = stage.icon || getDefaultStageIcon(stage.label);

          return (
            <KanbanColumn
              key={stage.stageId || stage.value}
              id={stage.value}
              stageId={stage.stageId}
              title={stage.label}
              borderColor={stage.color}
              stageColor={stage.color}
              icon={icon}
              items={getLeadsByStage(stage)}
              stages={stages}
              setStages={setStages}
              onDeleteLead={onDeleteLead}
              onStageDeleted={onStageDeleted}
            />
          );
        })}
      </div>
    </DragDropContext>
  );
}
