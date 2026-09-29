"use client";

import { KanbanColumn } from "@/components/pages/leads/kanban/KanbanColumn";
import type { StageOption } from "@/components/ui/StageDropdown";
import { getDefaultStageIcon } from "@/lib/stage-utils";
import type { Lead } from "@/types/leads";
import { getLexoRankBetween, generateInitialRank, compareLexoRanks } from "@/utils/lexorank";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { useCallback, useRef, useState } from "react";
import { toast } from "react-toastify";

interface KanbanBoardProps {
  leads: Lead[];
  stages: StageOption[];
  setStages: (stages: StageOption[]) => void;
  onStageChange: (id: string, stageId: string) => void;
  onDeleteLead: (lead: Lead) => void;
  onStageDeleted: () => void;
  onStageUpdated?: () => void;
  onReorderLead?: (
    leadId: string,
    targetStageId: string,
    prevRank: string | null,
    nextRank: string | null,
    optimisticRank: string,
  ) => Promise<unknown> | void;
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

function buildInitialColumns(stages: StageOption[], leads: Lead[]): Record<string, Lead[]> {
  const columns: Record<string, Lead[]> = {};

  stages.forEach((stage) => {
    const stageLeads = leads.filter(
      (l) => matchLeadToStage(l.stage, stage) || l.stageId === stage.stageId,
    );

    // Sort column leads by LexoRank ASC, id ASC (never by creation date)
    const sorted = [...stageLeads].sort((a, b) => {
      const rankCmp = compareLexoRanks(a.rank, b.rank);
      if (rankCmp !== 0) return rankCmp;
      return (a.id || "").localeCompare(b.id || "");
    });

    // Ensure every card has a valid rank
    columns[stage.value] = sorted.map((lead, idx) => {
      if (!lead.rank) {
        return { ...lead, rank: generateInitialRank(idx) };
      }
      return lead;
    });
  });

  return columns;
}

export function KanbanBoard({
  leads,
  stages,
  setStages,
  onStageChange,
  onDeleteLead,
  onStageDeleted,
  onStageUpdated,
  onReorderLead,
}: KanbanBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [boardColumns, setBoardColumns] = useState<Record<string, Lead[]>>(() =>
    buildInitialColumns(stages, leads),
  );
  const [prevLeads, setPrevLeads] = useState(leads);
  const [prevStages, setPrevStages] = useState(stages);

  // Sync columns whenever stages or leads change from server/parent
  if (leads !== prevLeads || stages !== prevStages) {
    setPrevLeads(leads);
    setPrevStages(stages);
    setBoardColumns(buildInitialColumns(stages, leads));
  }

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // 1. Guard clauses
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceStageKey = source.droppableId;
    const targetStageKey = destination.droppableId;

    const targetStageOption = stages.find(
      (s) =>
        s.value === targetStageKey ||
        s.label === targetStageKey ||
        s.stageId === targetStageKey,
    );

    // 2. Save previous state snapshot for error rollback
    const rollbackState = structuredClone(boardColumns);

    // 3. Extract items in target column
    const targetCards = Array.from(boardColumns[targetStageKey] || []);
    let movedCard: Lead | undefined;

    // If moving within the same column, remove from original position first
    if (sourceStageKey === targetStageKey) {
      const [removed] = targetCards.splice(source.index, 1);
      movedCard = removed;
    } else {
      const sourceCards = Array.from(boardColumns[sourceStageKey] || []);
      const [removed] = sourceCards.splice(source.index, 1);
      movedCard = removed;
      // sourceCards updated
    }

    if (!movedCard) return;

    // 4. Resolve neighbor ranks at the drop slot
    const prevCard = targetCards[destination.index - 1] || null;
    const nextCard = targetCards[destination.index] || null;
    const prevRank = prevCard ? prevCard.rank || null : null;
    const nextRank = nextCard ? nextCard.rank || null : null;

    // 5. Compute optimistic rank and update UI
    const optimisticRank = getLexoRankBetween(prevRank, nextRank);

    const updatedCard: Lead = {
      ...movedCard,
      stage: targetStageOption?.value || targetStageKey,
      stageId: targetStageOption?.stageId || movedCard.stageId,
      stageIcon:
        targetStageOption?.icon !== undefined
          ? targetStageOption.icon
          : movedCard.stageIcon,
      rank: optimisticRank,
    };

    targetCards.splice(destination.index, 0, updatedCard);

    const newColumns: Record<string, Lead[]> = {
      ...boardColumns,
      [targetStageKey]: targetCards,
    };
    if (sourceStageKey !== targetStageKey) {
      newColumns[sourceStageKey] = boardColumns[sourceStageKey];
    }

    // 0ms UI lag: card stays precisely where the user dropped it
    setBoardColumns(newColumns);

    // 6. Dispatch API Request to backend
    const targetStageId = targetStageOption?.stageId || targetStageKey;
    const targetStageName = targetStageOption?.label || targetStageKey;

    try {
      if (onReorderLead) {
        await onReorderLead(
          draggableId,
          targetStageId,
          prevRank,
          nextRank,
          optimisticRank,
        );
      } else {
        onStageChange(draggableId, targetStageName);
      }
    } catch (err) {
      console.error("Reorder error, rolling back:", err);
      setBoardColumns(rollbackState);
      toast.error("Could not move card. Changes reverted.");
    }
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
              items={boardColumns[stage.value] || []}
              stages={stages}
              setStages={setStages}
              onDeleteLead={onDeleteLead}
              onStageDeleted={onStageDeleted}
              onStageUpdated={onStageUpdated}
            />
          );
        })}
      </div>
    </DragDropContext>
  );
}
