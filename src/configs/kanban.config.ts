import type { KanbanStage } from "@/types/kanban";

export const KANBAN_STAGES: {
  id: KanbanStage;
  title: string;
  borderColor: string;
  stageColor: string;
  stageTextColor: string;
  icon: string;
}[] = [
  {
    id: "new",
    title: "New",
    borderColor: "#0098E8",
    stageColor: "bg-[#0098E8]",
    stageTextColor: "text-[#0098E8]",
    icon: "kanban-new",
  },
  {
    id: "contracted",
    title: "Contracted",
    borderColor: "#FFAF00",
    stageColor: "bg-[#FFAF00]",
    stageTextColor: "text-[#FFAF00]",
    icon: "kanban-contract",
  },
  {
    id: "converted",
    title: "Converted",
    borderColor: "#006F1F",
    stageColor: "bg-[#006F1F]",
    stageTextColor: "text-[#006F1F]",
    icon: "kanban-convert",
  },
  {
    id: "lost",
    title: "Lost",
    borderColor: "#FF4345",
    stageColor: "bg-[#FF4345]",
    stageTextColor: "text-[#FF4345]",
    icon: "kanban-lost",
  },
];