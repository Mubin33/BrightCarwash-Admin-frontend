"use client";

import { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TemplatePreviewModal } from "@/components/pages/campaigns/create/templates/TemplatePreviewModal";
import type { Template } from "@/types/template";

interface TemplateCardProps {
	template: Template;
	onUse: (template: Template) => void;
	isSelected?: boolean;
}

export function TemplateCard({ template, onUse, isSelected }: TemplateCardProps) {
	const [previewOpen, setPreviewOpen] = useState(false);
	const [iframeLoaded, setIframeLoaded] = useState(false);
	const [iframeError, setIframeError] = useState(false);

	// Reset iframe state when template changes
	useEffect(() => {
		setIframeLoaded(false);
		setIframeError(false);
	}, [template.id]);


	const htmlContent = template.html || template.emailBody?.htmlContent || '<div style="padding:20px;color:#999;">No preview available</div>';

	return (
		<>
			<div className={`flex p-4 flex-col items-start gap-6 flex-1 rounded-lg border-2 bg-white min-w-0 transition-all ${isSelected ? "border-[#006F1F] ring-2 ring-[#006F1F]/20" : "border-[#DFE1E7]"
				}`}>
				{/* Preview Image */}
				<div className="h-[212px] self-stretch rounded-xl border border-[#DFE1E7] relative overflow-hidden bg-[#F8FAFB]">
					{!iframeLoaded && !iframeError && (
						<div className="absolute inset-0 flex items-center justify-center">
							<div className="w-8 h-8 border-2 border-[#0098E8] border-t-transparent rounded-full animate-spin" />
						</div>
					)}
					{iframeError ? (
						<div className="absolute inset-0 flex items-center justify-center text-[#777980] font-inter text-sm">
							Preview unavailable
						</div>
					) : (
						<iframe
							srcDoc={htmlContent}
							title={template.name}
							className="w-full h-full pointer-events-none"
							sandbox="allow-same-origin"
							style={{ transform: "scale(0.3)", transformOrigin: "0 0", width: "333%", height: "333%" }}
							onLoad={() => setIframeLoaded(true)}
							onError={() => {
								setIframeError(true);
								setIframeLoaded(true);
							}}
						/>
					)}
					<button
						onClick={() => setPreviewOpen(true)}
						className="flex p-2 items-center gap-3 absolute right-2.5 top-2.5 rounded-lg bg-[#B23730] hover:bg-[#9A2E28] transition-colors z-10"
					>
						<Eye size={16} className="text-white" />
					</button>
				</div>

				{/* Name */}
				<span className="text-[#1D1F2C] font-inter text-base font-medium">{template.name}</span>

				{/* Use Template / Selected */}
				{isSelected ? (
					<div className="flex py-2.5 px-4 justify-center items-center gap-2 rounded bg-[#DCF7EA] text-[#006F1F] font-inter text-sm w-full font-medium">
						✓ Selected
					</div>
				) : (
					<Button variant="outline" onClick={() => onUse(template)} className="flex py-2.5 px-4 justify-center items-center gap-2 rounded border border-[#DFE1E7] text-[#1B1B1B] font-inter text-sm w-full">
						Use template
					</Button>
				)}
			</div>

			<TemplatePreviewModal
				isOpen={previewOpen}
				onClose={() => setPreviewOpen(false)}
				template={template}
				onUse={onUse}
			/>
		</>
	);
}