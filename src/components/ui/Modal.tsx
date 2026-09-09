"use client";

import { useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ModalProps } from "@/types/modal";

const sizeClasses: Record<string, string> = {
	sm: "max-w-sm",
	md: "max-w-lg",
	lg: "max-w-2xl",
};

export function Modal({
	isOpen,
	onClose,
	title,
	children,
	size = "md",
	glass = false,
	bodyClassName = "",
}: ModalProps) {
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		},
		[onClose]
	);

	useEffect(() => {
		if (isOpen) {
			document.addEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "hidden";
		}
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "";
		};
	}, [isOpen, handleKeyDown]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-100 flex items-center justify-center p-4">
			<div
				className="fixed inset-0 bg-black/40 backdrop-blur-sm adm-modal-overlay"
				onClick={onClose}
			/>
			<div
				className={`relative w-full ${sizeClasses[size]} rounded-2xl shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200 ${glass
					? "adm-glass-card bg-white/5"
					: "bg-white border border-[#E8E8E9]"
					}`}
			>
				{/* Header */}
				<div className="flex items-center justify-between px-6 pt-5 pb-3 relative z-10">
					<div className="text-[#1B1B1B] font-inter text-lg font-semibold leading-[130%]">
						{title}
					</div>
					<Button
						variant="icon"
						onClick={onClose}
						className="flex p-2 items-center rounded-lg text-[#777980] hover:bg-white/30 hover:text-[#1B1B1B] transition-colors"
					>
						<X size={20} />
					</Button>
				</div>

				{/* Divider */}
				<div className="w-full h-px bg-[#DFE1E7]" />

				{/* Body */}
				<div className={`px-6 py-4 ${bodyClassName}`}>{children}</div>
			</div>
		</div>
	);
}