"use client";

import { useState, useEffect, useMemo } from "react";
import { Icon } from "@/components/ui/Icon";
import { DataTable } from "@/components/ui/DataTable";
import { TemplatePreviewModal } from "@/components/pages/campaigns/create/templates/TemplatePreviewModal";
import { createTemplatesColumns } from "@/components/pages/campaigns/create/templates/TemplatesColumns";
import { getSavedTemplates } from "@/services/template.service";
import type { Template } from "@/types/template";
import { toast } from "react-toastify";

interface StepThreeTableProps {
	onTemplateSelect: (name: string, id: string) => void;
}

export function StepThreeTable({ onTemplateSelect }: StepThreeTableProps) {
	const [savedTemplates, setSavedTemplates] = useState<Template[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

	useEffect(() => {
		getSavedTemplates()
			.then(setSavedTemplates)
			.catch(() => toast.error("Failed to load templates"))
			.finally(() => setLoading(false));
	}, []);

	const handleUse = (template: Template) => {
		setSelectedId(template.id);
		toast.success(`"${template.name}" selected for this campaign`);
		onTemplateSelect(template.name, template.id);
		setPreviewTemplate(null);
	};

	const handleView = (template: Template) => {
		setPreviewTemplate(template);
	};

	const columns = useMemo(() => createTemplatesColumns({
		onView: handleView,
		onEdit: () => { },
		onDelete: () => { },
	}), []);

	return (
		<div className="flex p-4 flex-col gap-4 self-stretch rounded-xl border border-[#DFE1E7] bg-[#F8FAFB]">
			<div className="flex items-start gap-3">
				<Icon name="convert" width={24} height={24} color="#0098E8" />
				<div className="flex flex-col gap-1">
					<span className="text-[#1D1F2C] font-inter text-2xl font-medium leading-[100%]">Your saved templates</span>
					<span className="text-[#4A4C56] font-inter text-sm font-normal leading-[150%] tracking-[0.28px]">Start building your email using a previously saved template.</span>
				</div>
			</div>
			{loading ? (
				<div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
			) : savedTemplates.length === 0 ? (
				<div className="flex items-center justify-center py-12 text-[#777980] font-inter text-sm">No saved templates yet. Create one in the email editor.</div>
			) : (
				<DataTable
					columns={columns}
					data={savedTemplates}
					rowKey={(row) => row.id}
					className="w-full border border-[#E8E8E9] rounded-lg"
				/>
			)}

			<TemplatePreviewModal
				isOpen={!!previewTemplate}
				onClose={() => setPreviewTemplate(null)}
				template={previewTemplate}
				onUse={handleUse}
			/>
		</div>
	);
}