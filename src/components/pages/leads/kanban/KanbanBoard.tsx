'use client';

import { useRef, useCallback } from 'react';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { KanbanColumn } from '@/components/pages/leads/kanban/KanbanColumn';
import type { Lead } from '@/types/leads';
import type { StageOption } from '@/components/ui/StageDropdown';
import { getDefaultStageIcon, getStageIconUrl } from '@/lib/stage-utils';

interface KanbanBoardProps {
	leads: Lead[];
	stages: StageOption[];
	onStageChange: (id: string, stageId: string) => void;
	onDeleteLead: (lead: Lead) => void;
	onStageDeleted: () => void;
}

export function KanbanBoard({
	leads,
	stages,
	onStageChange,
	onDeleteLead,
	onStageDeleted
}: KanbanBoardProps) {
	const boardRef = useRef<HTMLDivElement>(null);

	const getLeadsByStage = (stageValue: string): Lead[] =>
		leads.filter((l) => l.stage === stageValue);

	const handleDragEnd = (result: DropResult) => {
		if (!result.destination) return;
		const { draggableId, destination } = result;
		const targetStage = destination.droppableId;
		const lead = leads.find((l) => l.id === draggableId);
		if (!lead || lead.stage === targetStage) return;
		const stageOption = stages.find((s) => s.value === targetStage);
		onStageChange(draggableId, stageOption?.label || targetStage);
	};

	const handleWheel = useCallback((e: React.WheelEvent) => {
		const target = e.target as HTMLElement;
		if (target.closest('.adm-kanban-scroll')) return;
		if (!boardRef.current) return;
		e.preventDefault();
		boardRef.current.scrollLeft += e.deltaY;
	}, []);

	return (
		<DragDropContext onDragEnd={handleDragEnd}>
			<div
				ref={boardRef}
				onWheel={handleWheel}
				className='flex gap-4 overflow-x-auto pb-4 adm-kanban-board h-full'
			>
				{stages.map((stage) => {

					const icon = stage.icon || getDefaultStageIcon(stage.label);
					return (
						<KanbanColumn
							key={stage.stageId}
							id={stage.value}
							stageId={stage.stageId}
							title={stage.label}
							borderColor={stage.color}
							stageColor={stage.color}
							icon={icon}
							items={getLeadsByStage(stage.value)}
							stages={stages}
							onDeleteLead={onDeleteLead}
							onStageDeleted={onStageDeleted}
						/>
					);
				})}
			</div>
		</DragDropContext>
	);
}