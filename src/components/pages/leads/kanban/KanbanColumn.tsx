'use client';

import { useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Trash2 } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { KanbanCard } from '@/components/pages/leads/kanban/KanbanCard';
import { AddLeadModal } from '@/components/pages/leads/kanban/AddLeadModal';
import type { Lead } from '@/types/leads';
import type { StageOption } from '@/components/ui/StageDropdown';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { deleteStage } from '@/services/stage.service';
import { getDefaultStageIcon, getStageIconUrl } from '@/lib/stage-utils';

interface KanbanColumnProps {
	id: string;
	stageId: string;
	title: string;
	borderColor: string;
	stageColor: string;
	icon: string;
	items: Lead[];
	stages: StageOption[];
	onDeleteLead: (lead: Lead) => void;
	onStageDeleted: () => void;
}

export function KanbanColumn({
	id,
	title,
	borderColor,
	icon,
	items,
	stageId,
	stages,
	onDeleteLead,
	onStageDeleted
}: KanbanColumnProps) {
	const [modalOpen, setModalOpen] = useState(false);
	const [iconError, setIconError] = useState(false);
	const badgeTint = borderColor + '26';

	const isIconUrl = icon && (icon.startsWith('http://') || icon.startsWith('https://'));
	const normalizedIconUrl = isIconUrl ? getStageIconUrl(icon) : null;
	const shouldShowIcon = isIconUrl && normalizedIconUrl && !iconError;

	return (
		<>
			<div
				className='flex w-70 min-w-70 h-full p-3 pt-5 flex-col items-center gap-4 rounded-2xl bg-[#F7F7F7] shrink-0 overflow-hidden relative shadow-sm'
				style={{ borderTop: `5px solid ${borderColor}` }}
			>
				<div
					className='flex py-3 pl-3 pr-4 items-center gap-2 self-stretch rounded-lg border transition-all justify-between'
					style={{
						backgroundColor: badgeTint,
						borderColor: borderColor,
					}}
				>
					<div className='flex items-center gap-2'>
						{shouldShowIcon ? (
							<div className="w-[18px] h-[18px] flex items-center justify-center">
								<Image
									src={normalizedIconUrl}
									alt={title}
									width={18}
									height={18}
									className="object-contain"
									unoptimized
									crossOrigin="anonymous"
									onError={() => setIconError(true)}
								/>
							</div>
						) : (
							<Icon name={getDefaultStageIcon(title)} width={18} height={18} color={borderColor} />
						)}
						<span
							className='text-sm font-semibold capitalize leading-none tracking-tight'
							style={{ color: borderColor }}
						>
							{title}
						</span>
						<span
							className='text-white font-inter text-xs font-bold px-2 py-0.5 rounded-full leading-none shadow-[0_2px_4px_rgba(0,0,0,0.15)]'
							style={{ backgroundColor: borderColor }}
						>
							{items.length}
						</span>
					</div>

					<Button
						variant='icon'
						onClick={() => setModalOpen(true)}
						className='flex p-1.5 items-center rounded-lg border border-transparent text-[#777980] cursor-pointer hover:bg-white/70 hover:border-[#D0D5DD] hover:text-[#1B1B1B] transition-all duration-200'
					>
						<Plus size={18} />
					</Button>
					<Button
						variant='icon'
						onClick={async () => {
							if (!confirm(`Delete stage "${title}"?`)) return;
							try {
								await deleteStage(stageId);
								toast.success(`Stage "${title}" deleted`);
								onStageDeleted();
							} catch {
								toast.error('Failed to delete stage');
							}
						}}
						className='flex p-1.5 items-center rounded-lg border border-transparent text-[#777980] cursor-pointer hover:bg-white/70 hover:border-[#D0D5DD] hover:text-[#FF4345] transition-all duration-200'
					>
						<Trash2 size={18} />
					</Button>
				</div>

				<Droppable droppableId={id}>
					{(provided, snapshot) => (
						<div
							ref={provided.innerRef}
							{...provided.droppableProps}
							className={`flex-1 w-full overflow-hidden rounded-xl min-h-0 transition-colors ${snapshot.isDraggingOver
								? 'bg-[#EBF5FF] shadow-[inset_0_0_0_2px_rgba(0,152,232,0.2)]'
								: ''
								}`}
						>
							<div className='flex flex-col items-center gap-3 w-full h-full overflow-y-auto adm-kanban-scroll py-1'>
								{items.map((lead, index) => (
									<Draggable key={lead.id} draggableId={lead.id} index={index}>
										{(provided, snapshot) => (
											<div
												ref={provided.innerRef}
												{...provided.draggableProps}
												{...provided.dragHandleProps}
												className={`w-full transition-all duration-200 ${snapshot.isDragging
													? 'z-50 scale-105 rotate-1 shadow-2xl'
													: ''
													}`}
												style={provided.draggableProps.style}
											>
												<KanbanCard lead={lead} index={index} onDelete={onDeleteLead} />
											</div>
										)}
									</Draggable>
								))}
								{provided.placeholder}
							</div>
						</div>
					)}
				</Droppable>
			</div>

			<AddLeadModal
				isOpen={modalOpen}
				onClose={() => setModalOpen(false)}
				stage={title}
				stageId={stageId}
				borderColor={borderColor}
				stages={stages}
			/>
		</>
	);
}