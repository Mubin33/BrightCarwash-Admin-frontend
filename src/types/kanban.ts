import type { Lead, LeadStage } from "@/types/leads";

export type KanbanStage = LeadStage;

export interface KanbanColumn {
  id: KanbanStage;
  title: string;
  borderColor: string;
  stageColor: string;
  stageTextColor: string;
  items: Lead[];
}

export interface KanbanProps {
  leads: Lead[];
  onStageChange: (id: string, stage: LeadStage) => void;
}