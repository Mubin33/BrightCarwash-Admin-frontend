"use client";

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Ellipsis } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { usePermission } from '@/hooks/usePermission';

interface ActionItem {
	label: string;
	onClick: () => void;
	variant?: 'default' | 'danger';
	disabled?: boolean;
	permission?: string;
}

interface ActionsDropdownProps {
	items: ActionItem[];
}

const DROPDOWN_WIDTH = 160;
const GAP = 4;
const VIEWPORT_PADDING = 8;
const MAX_HEIGHT = 260;

export function ActionsDropdown({ items }: ActionsDropdownProps) {
	const [open, setOpen] = useState(false);
	const [dropdownStyle, setDropdownStyle] = useState<Record<string, string>>({});
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
			const filteredItems = items.filter((item) => {
				if (!item.permission) return true;
				return true; // checked in DropdownItem
			});
			const dropdownHeight = Math.min(MAX_HEIGHT, filteredItems.length * 40 + 16);
			const viewportHeight = window.innerHeight;
			const viewportWidth = window.innerWidth;

			let left = rect.right - DROPDOWN_WIDTH;
			left = Math.max(VIEWPORT_PADDING, Math.min(left, viewportWidth - DROPDOWN_WIDTH - VIEWPORT_PADDING));

			const spaceBelow = viewportHeight - rect.bottom;
			const spaceAbove = rect.top;
			const needsFlip = spaceBelow < dropdownHeight + GAP && spaceAbove > spaceBelow;

			let top: number;
			if (needsFlip) {
				top = rect.top - dropdownHeight - GAP;
				if (top < VIEWPORT_PADDING) top = VIEWPORT_PADDING;
			} else {
				top = rect.bottom + GAP;
				const maxTop = viewportHeight - dropdownHeight - VIEWPORT_PADDING;
				if (top > maxTop) top = maxTop;
			}

			setDropdownStyle({
				position: 'fixed',
				top: `${top}px`,
				left: `${left}px`,
				width: `${DROPDOWN_WIDTH}px`,
				maxHeight: `${dropdownHeight}px`,
				overflowY: 'auto',
				zIndex: '9999',
			});
		}
	}, [open, items]);

	const filteredItems = items.filter((item) => {
		if (!item.permission) return true;
		return true; // checked in DropdownItem
	});

	if (filteredItems.length === 0) return null;

	return (
		<div ref={ref} className='relative inline-block'>
			<div
				ref={btnRef}
				onClick={() => setOpen(!open)}
				className='flex p-1.5 items-center gap-3 rounded-md border border-[#E8E8E9] bg-white cursor-pointer hover:bg-[#F8FAFB]'
			>
				<Ellipsis size={16} className='text-[#777980]' />
			</div>

			{open && createPortal(
				<div
					ref={portalRef}
					className='bg-white rounded-lg border border-[#E8E8E9] shadow-lg overflow-hidden'
					style={dropdownStyle}
				>
					{filteredItems.map((item) => (
						<DropdownItem key={item.label} item={item} onSelect={() => setOpen(false)} />
					))}
				</div>,
				document.body
			)}
		</div>
	);
}

function DropdownItem({ item, onSelect }: { item: ActionItem; onSelect: () => void }) {
	const hasPerm = usePermission(item.permission || '');

	if (item.permission && !hasPerm) return null;

	return (
		<Button
			variant='icon'
			onClick={() => {
				if (item.disabled) return;
				item.onClick();
				onSelect();
			}}
			className={`flex w-full py-2.5 px-4 items-center text-sm text-left cursor-pointer transition-colors ${item.disabled
				? 'text-[#A5A5AB] cursor-not-allowed'
				: item.variant === 'danger'
					? 'text-[#FF4345] hover:bg-[#FFE6E6]'
					: 'text-[#1B1B1B] hover:bg-[#F8FAFB]'
				}`}
		>
			{item.label}
		</Button>
	);
}