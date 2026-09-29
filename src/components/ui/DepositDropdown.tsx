"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface DepositOption {
	value: string;
	label: string;
	color: string;
	bg: string;
	border: string;
}

export const DEPOSIT_STATUS_OPTIONS: DepositOption[] = [
	{
		value: "PAID",
		label: "Paid",
		color: "#006F1F",
		bg: "rgba(0, 111, 31, 0.12)",
		border: "rgba(0, 111, 31, 0.25)",
	},
	{
		value: "PENDING",
		label: "Pending",
		color: "#FFAF00",
		bg: "rgba(255, 175, 0, 0.12)",
		border: "rgba(255, 175, 0, 0.3)",
	},
	{
		value: "REFUNDED",
		label: "Refunded",
		color: "#FF4345",
		bg: "rgba(255, 67, 69, 0.12)",
		border: "rgba(255, 67, 69, 0.3)",
	},
	{
		value: "NONE",
		label: "None",
		color: "#777980",
		bg: "rgba(119, 121, 128, 0.12)",
		border: "rgba(119, 121, 128, 0.25)",
	},
];

interface DepositDropdownProps {
	currentStatus?: string;
	onSelect: (status: string) => void;
	showPrefix?: boolean;
}

const DROPDOWN_WIDTH = 140;
const GAP = 2;
const VIEWPORT_PADDING = 4;
const MAX_HEIGHT = 180;
const ITEM_HEIGHT = 32;
const EXTRA_HEIGHT = 8;

export function DepositDropdown({
	currentStatus,
	onSelect,
	showPrefix = true,
}: DepositDropdownProps) {
	const [open, setOpen] = useState(false);
	const [dropdownStyle, setDropdownStyle] = useState<Record<string, string>>({});
	const ref = useRef<HTMLDivElement>(null);
	const btnRef = useRef<HTMLDivElement>(null);
	const portalRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (!open) return;
			const target = e.target as Node;
			if (
				portalRef.current?.contains(target) ||
				ref.current?.contains(target)
			) {
				return;
			}
			setOpen(false);
		}
		document.addEventListener("click", handleClickOutside);
		return () => document.removeEventListener("click", handleClickOutside);
	}, [open]);

	useEffect(() => {
		if (open && btnRef.current) {
			const rect = btnRef.current.getBoundingClientRect();
			const estimatedHeight = Math.min(
				MAX_HEIGHT,
				DEPOSIT_STATUS_OPTIONS.length * ITEM_HEIGHT + EXTRA_HEIGHT
			);
			const viewportHeight = window.innerHeight;
			const viewportWidth = window.innerWidth;

			let left = rect.left;
			left = Math.max(
				VIEWPORT_PADDING,
				Math.min(left, viewportWidth - DROPDOWN_WIDTH - VIEWPORT_PADDING)
			);

			const spaceBelow = viewportHeight - rect.bottom;
			const spaceAbove = rect.top;
			const needsFlip =
				spaceBelow < estimatedHeight + GAP && spaceAbove > spaceBelow;

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
				position: "fixed",
				top: `${top}px`,
				left: `${left}px`,
				width: `${DROPDOWN_WIDTH}px`,
				maxHeight: `${estimatedHeight}px`,
				overflowY: "auto",
				zIndex: "9999",
			});
		}
	}, [open]);

	const normStatus = (currentStatus || "NONE").toUpperCase().trim();
	const currentOption =
		DEPOSIT_STATUS_OPTIONS.find((o) => o.value === normStatus) ||
		DEPOSIT_STATUS_OPTIONS[3];

	return (
		<div ref={ref} className="relative inline-block">
			<div
				ref={btnRef}
				onClick={() => setOpen(!open)}
				className="inline-flex py-1.5 pl-2 pr-1.5 justify-center items-center gap-1.5 rounded text-xs font-medium capitalize cursor-pointer transition-colors"
				style={{
					backgroundColor: currentOption.bg,
					color: currentOption.color,
					border: `1px solid ${currentOption.border}`,
				}}
			>
				<span
					className="w-1.5 h-1.5 rounded-full shrink-0"
					style={{ backgroundColor: currentOption.color }}
				/>
				<span>
					{showPrefix ? `Deposit: ${currentOption.label}` : currentOption.label}
				</span>
				<ChevronDown
					size={12}
					style={{ color: currentOption.color, opacity: 0.7 }}
				/>
			</div>

			{open &&
				createPortal(
					<div
						ref={portalRef}
						className="bg-white rounded-lg border border-[#E8E8E9] shadow-lg overflow-hidden"
						style={dropdownStyle}
					>
						{DEPOSIT_STATUS_OPTIONS.map((option) => {
							const isSelected = option.value === normStatus;

							return (
								<Button
									key={option.value}
									variant="icon"
									onClick={() => {
										onSelect(option.value);
										setOpen(false);
									}}
									className={`flex w-full py-2 px-3 items-center gap-2 text-xs font-medium capitalize cursor-pointer transition-colors ${
										isSelected
											? "bg-[#0098E8] text-white"
											: "text-[#1B1B1B] hover:bg-[#F8FAFB]"
									}`}
								>
									<span
										className="w-2 h-2 rounded-full shrink-0"
										style={{
											backgroundColor: isSelected ? "#FFFFFF" : option.color,
										}}
									/>
									{option.label}
								</Button>
							);
						})}
					</div>,
					document.body
				)}
		</div>
	);
}
