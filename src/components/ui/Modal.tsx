"use client";

import { useEffect, useCallback, useRef, useId } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ModalProps } from "@/types/modal";

const sizeClasses: Record<string, string> = {
	sm: "max-w-sm",
	md: "max-w-lg",
	lg: "max-w-2xl",
};

const FOCUSABLE_SELECTOR =
	'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container: HTMLElement): HTMLElement[] {
	const elements = Array.from(
		container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
	);
	return elements.filter((el) => {
		return (
			el.offsetWidth > 0 ||
			el.offsetHeight > 0 ||
			el.getClientRects().length > 0
		);
	});
}

export function Modal({
	isOpen,
	onClose,
	title,
	children,
	size = "md",
	glass = false,
	bodyClassName = "",
}: ModalProps) {
	const titleId = useId();
	const modalRef = useRef<HTMLDivElement>(null);
	const previousActiveElementRef = useRef<HTMLElement | null>(null);

	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
				return;
			}

			if (e.key === "Tab" && modalRef.current) {
				const focusableElements = getFocusableElements(modalRef.current);
				if (focusableElements.length === 0) {
					e.preventDefault();
					modalRef.current.focus();
					return;
				}

				const firstElement = focusableElements[0];
				const lastElement = focusableElements[focusableElements.length - 1];

				if (e.shiftKey) {
					if (
						document.activeElement === firstElement ||
						document.activeElement === modalRef.current ||
						!modalRef.current.contains(document.activeElement)
					) {
						e.preventDefault();
						lastElement.focus();
					}
				} else {
					if (
						document.activeElement === lastElement ||
						!modalRef.current.contains(document.activeElement)
					) {
						e.preventDefault();
						firstElement.focus();
					}
				}
			}
		},
		[onClose]
	);

	useEffect(() => {
		if (!isOpen) return;

		// Save the element that had focus before the modal was opened
		previousActiveElementRef.current = document.activeElement as HTMLElement | null;

		document.addEventListener("keydown", handleKeyDown);
		document.body.style.overflow = "hidden";

		// Focus management: initial focus inside the dialog
		const rafId = requestAnimationFrame(() => {
			if (!modalRef.current) return;

			// Do not override if focus was already directed to a child element (e.g. autoFocus)
			if (modalRef.current.contains(document.activeElement)) return;

			const focusables = getFocusableElements(modalRef.current);
			const firstInput = modalRef.current.querySelector<HTMLElement>(
				'input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled])'
			);

			if (firstInput && focusables.includes(firstInput)) {
				firstInput.focus();
			} else if (focusables.length > 0) {
				focusables[0].focus();
			} else {
				modalRef.current.focus();
			}
		});

		return () => {
			cancelAnimationFrame(rafId);
			document.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "";

			// Restore focus to original element when modal closes
			if (
				previousActiveElementRef.current &&
				typeof previousActiveElementRef.current.focus === "function" &&
				document.contains(previousActiveElementRef.current)
			) {
				previousActiveElementRef.current.focus();
			}
		};
	}, [isOpen, handleKeyDown]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-100 flex items-center justify-center p-4">
			<div
				className="fixed inset-0 bg-black/40 backdrop-blur-sm adm-modal-overlay"
				onClick={onClose}
				aria-hidden="true"
			/>
			<div
				ref={modalRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby={title ? titleId : undefined}
				tabIndex={-1}
				className={`relative w-full ${sizeClasses[size]} rounded-2xl shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200 outline-none ${glass
					? "adm-glass-card bg-white/5"
					: "bg-white border border-[#E8E8E9]"
					}`}
			>
				{/* Header */}
				<div className="flex items-center justify-between px-6 pt-5 pb-3 relative z-10">
					<h2
						id={titleId}
						className="text-[#1B1B1B] font-inter text-lg font-semibold leading-[130%]"
					>
						{title}
					</h2>
					<Button
						variant="icon"
						onClick={onClose}
						aria-label="Close modal"
						className="flex p-2 items-center rounded-lg text-[#777980] hover:bg-white/30 hover:text-[#1B1B1B] transition-colors"
					>
						<X size={20} aria-hidden="true" />
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
