'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface FilterDropdownProps {
	label: string;
	options: { value: string; label: string }[];
	value: string;
	onChange: (value: string) => void;
	className?: string;
	fullWidth?: boolean;
	buttonClassName?: string;
	dropdownOffsetX?: number;
	scrollable?: boolean;
	maxHeight?: number;
}

export function FilterDropdown({
	label,
	options,
	value,
	onChange,
	className = '',
	fullWidth = false,
	buttonClassName = '',
	dropdownOffsetX = 0,
	scrollable = false,
	maxHeight = 200,
}: FilterDropdownProps) {
	const [open, setOpen] = useState(false);
	const [dropdownStyle, setDropdownStyle] = useState<Record<string, string>>(
		{},
	);
	const [position, setPosition] = useState<'bottom' | 'top'>('bottom');
	const containerRef = useRef<HTMLDivElement>(null);
	const btnRef = useRef<HTMLButtonElement>(null);
	const dropdownMenuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClick(e: MouseEvent) {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				if (
					dropdownMenuRef.current &&
					!dropdownMenuRef.current.contains(e.target as Node)
				) {
					setOpen(false);
				}
			}
		}
		document.addEventListener('mousedown', handleClick);
		return () => document.removeEventListener('mousedown', handleClick);
	}, []);

	useEffect(() => {
		if (open && btnRef.current) {
			const rect = btnRef.current.getBoundingClientRect();
			const dropdownHeight = Math.min(maxHeight, 300); // Approximate max height
			const spaceBelow = window.innerHeight - rect.bottom - 10;
			const spaceAbove = rect.top - 10;


			const shouldGoUp = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
			const finalPosition = shouldGoUp ? 'top' : 'bottom';
			setPosition(finalPosition);

			setDropdownStyle({
				position: 'fixed',
				top:
					finalPosition === 'bottom'
						? `${rect.bottom + 4}px`
						: `${rect.top - dropdownHeight - 4}px`,
				left: `${rect.left + dropdownOffsetX}px`,
				width: fullWidth ? `${rect.width}px` : 'auto',
				minWidth: fullWidth ? 'auto' : '160px',
				maxHeight: `${dropdownHeight}px`,
				zIndex: '9999',
			});
		}
	}, [open, fullWidth, dropdownOffsetX, maxHeight]);

	const selectedLabel = value
		? options.find((o) => o.value === value)?.label || label
		: label;

	const defaultBtnClass =
		'border-[#E8E8E9] bg-white text-[#1B1B1B] hover:bg-[#F8FAFB]';


	const dropdownPositionClass = position === 'top' ? 'bottom-full' : '';

	return (
		<div
			ref={containerRef}
			className={`relative ${fullWidth ? 'w-full' : ''} ${className}`}
		>
			<button
				ref={btnRef}
				type='button'
				onClick={() => setOpen(!open)}
				className={`flex px-4 py-3 items-center gap-2 rounded-lg border text-sm font-inter cursor-pointer transition-colors ${fullWidth ? 'w-full justify-between' : 'whitespace-nowrap'
					} ${buttonClassName || defaultBtnClass}`}
			>
				<span
					className={
						buttonClassName ? '' : value ? 'text-[#1B1B1B]' : 'text-[#777980]'
					}
				>
					{selectedLabel}
				</span>
				<ChevronDown
					size={16}
					className={`transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''
						} ${buttonClassName ? 'text-inherit' : 'text-[#777980]'}`}
				/>
			</button>

			{open &&
				createPortal(
					<div
						ref={dropdownMenuRef}
						className={`adm-glass-dropdown-menu ${scrollable ? 'adm-dropdown-scrollable' : ''}`}
						style={dropdownStyle}
					>
						<Button
							variant='icon'
							type='button'
							onClick={() => {
								onChange('');
								setOpen(false);
							}}
							className={`flex w-full py-2.5 px-4 items-center text-sm text-left cursor-pointer transition-colors ${!value
								? 'bg-[#0098E8] text-white'
								: 'text-[#1B1B1B] hover:bg-[#F8FAFB]'
								}`}
						>
							{label}
						</Button>
						{options.map((option) => (
							<Button
								key={option.value}
								variant='icon'
								type='button'
								onClick={() => {
									onChange(option.value);
									setOpen(false);
								}}
								className={`flex w-full py-2.5 px-4 items-center text-sm text-left cursor-pointer transition-colors capitalize ${value === option.value
									? 'bg-[#0098E8] text-white'
									: 'text-[#1B1B1B] hover:bg-[#F8FAFB]'
									}`}
							>
								{option.label}
							</Button>
						))}
					</div>,
					document.body,
				)}
		</div>
	);
}
