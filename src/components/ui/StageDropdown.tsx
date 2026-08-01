'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CreateStageModal } from '@/components/pages/leads/CreateStageModal';
import { StageIcon } from '@/components/ui/StageIcon';
import { getDefaultStageIcon } from '@/lib/stage-utils';

export interface StageOption {
	value: string;      // ✅ Slug (e.g., "new", "post_lead")
	label: string;      // ✅ Actual stage name (e.g., "New", "Post Lead")
	color: string;
	stageId: string;
	icon?: string | null;
}

interface StageDropdownProps {
	currentStage: string;  // ✅ This is the slug (e.g., "new", "post_lead")
	stages: StageOption[];
	onSelect: (stageName: string) => void;  // ✅ Passes the stage name (label)
	onStageCreated?: () => void;
}

const defaultColor = '#0098E8';
const DROPDOWN_WIDTH = 176;
const GAP = 2;
const VIEWPORT_PADDING = 4;
const MAX_HEIGHT = 260;
const ITEM_HEIGHT = 20;
const EXTRA_HEIGHT = 8;

function hexToTintedBg(hex: string): string {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	return `rgba(${r}, ${g}, ${b}, 0.12)`;
}

export function StageDropdown({
	currentStage,
	stages,
	onSelect,
	onStageCreated,
}: StageDropdownProps) {
	const [open, setOpen] = useState(false);
	const [dropdownStyle, setDropdownStyle] = useState<Record<string, string>>({});
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const btnRef = useRef<HTMLDivElement>(null);
	const portalRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (!open) return;
			const target = e.target as Node;
			if (portalRef.current?.contains(target) || ref.current?.contains(target)) {
				return;
			}
			setOpen(false);
		}
		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	}, [open]);

	useEffect(() => {
		if (open && btnRef.current) {
			const rect = btnRef.current.getBoundingClientRect();
			const totalItems = stages.length + 1;
			const estimatedHeight = Math.min(MAX_HEIGHT, totalItems * ITEM_HEIGHT + EXTRA_HEIGHT);
			const viewportHeight = window.innerHeight;
			const viewportWidth = window.innerWidth;

			let left = rect.left;
			left = Math.max(VIEWPORT_PADDING, Math.min(left, viewportWidth - DROPDOWN_WIDTH - VIEWPORT_PADDING));

			const spaceBelow = viewportHeight - rect.bottom;
			const spaceAbove = rect.top;
			const needsFlip = spaceBelow < estimatedHeight + GAP && spaceAbove > spaceBelow;

			let top: number;
			if (needsFlip) {
				top = rect.top - estimatedHeight - GAP;
				if (top < VIEWPORT_PADDING) top = VIEWPORT_PADDING;
			} else {
				top = rect.bottom + GAP;
				const maxTop = viewportHeight - estimatedHeight - VIEWPORT_PADDING;
				if (top > maxTop) top = maxTop;
			}

			setDropdownStyle({
				position: 'fixed',
				top: `${top}px`,
				left: `${left}px`,
				width: `${DROPDOWN_WIDTH}px`,
				maxHeight: `${estimatedHeight}px`,
				overflowY: 'auto',
				zIndex: '9999',
			});
		}
	}, [open, stages.length]);

	// ✅ Find the stage by value (slug) or fallback
	const currentOption = stages.find((s) => s.value === currentStage);
	const currentColor = currentOption?.color || defaultColor;
	const tintedBg = hexToTintedBg(currentColor);

	const handleCreated = () => {
		setCreateModalOpen(false);
		if (onStageCreated) onStageCreated();
	};

	return (
		<>
			<div ref={ref} className='relative inline-block'>
				<div
					ref={btnRef}
					onClick={() => setOpen(!open)}
					className='inline-flex py-1.5 pl-2 pr-1 justify-center items-center gap-1 rounded text-sm capitalize cursor-pointer'
					style={{ backgroundColor: tintedBg, color: currentColor }}
				>
					<StageIcon
						icon={currentOption?.icon || null}
						stageName={currentOption?.label || currentStage}
						size={14}
						color={currentColor}
					/>
					{currentOption?.label || currentStage}
					<ChevronDown size={12} style={{ color: currentColor, opacity: 0.7 }} />
				</div>

				{open && createPortal(
					<div
						ref={portalRef}
						className='bg-white rounded-lg border border-[#E8E8E9] shadow-lg overflow-hidden'
						style={dropdownStyle}
					>
						{stages.map((stage) => {
							const isSelected = stage.value === currentStage;

							return (
								<Button
									key={stage.stageId}
									variant='icon'
									onClick={() => {
										// ✅ Pass the actual stage name (label) to parent
										onSelect(stage.label);
										setOpen(false);
									}}
									className={`flex w-full py-2.5 px-4 items-center gap-2 text-sm capitalize cursor-pointer transition-colors ${isSelected
										? 'bg-[#0098E8] text-white'
										: 'text-[#1B1B1B] hover:bg-[#F8FAFB]'
										}`}
								>
									<StageIcon
										icon={stage.icon || null}
										stageName={stage.label}
										size={14}
										color={isSelected ? '#FFFFFF' : stage.color || defaultColor}
									/>
									{stage.label}
								</Button>
							);
						})}
						<Button
							variant='icon'
							className='flex w-full py-2.5 px-4 items-center justify-center text-[#0098E8] font-inter text-sm border-t border-[#E8E8E9] hover:bg-[#F0F8FF] cursor-pointer'
							onClick={() => {
								setOpen(false);
								setCreateModalOpen(true);
							}}
						>
							Create new Stage
						</Button>
					</div>,
					document.body
				)}
			</div>

			<CreateStageModal
				isOpen={createModalOpen}
				onClose={() => setCreateModalOpen(false)}
				onCreated={handleCreated}
			/>
		</>
	);
}