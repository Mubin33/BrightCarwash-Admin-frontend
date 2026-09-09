"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { TemplatesList } from "@/components/pages/campaigns/create/templates/TemplatesList";
import { Template } from "@/types/template";


interface StepThreeDesignProps {
	onBack: () => void;
	onTemplateSelect: (name: string, id: string) => void;
}

export function StepThreeDesign({ onBack, onTemplateSelect }: StepThreeDesignProps) {
	const router = useRouter();
	const handleTemplateSelect = (template: Template) => {
		onTemplateSelect(template.name, template.id);
	};
	return (
		<div className="flex flex-col gap-6 self-stretch min-w-0">
			<div className="flex justify-between items-center self-stretch">
				<div className="flex items-center gap-3">
					<Button variant="icon" onClick={onBack} className="flex items-center text-[#777980] hover:text-[#1B1B1B] transition-colors p-0">
						<ChevronLeft size={20} />
					</Button>
					<span className="text-[#1B1B1B] font-inter text-lg font-semibold">Design</span>
				</div>
				<div className="flex items-center gap-3">
					<Button variant="outline" onClick={() => router.push("/campaigns/create/simple-editor")} className="flex py-2.5 px-4 items-center gap-2 rounded border border-[#DFE1E7] text-[#1B1B1B] font-inter text-sm w-auto!">
						Simple Editor
					</Button>
					<Button onClick={() => router.push("/campaigns/create/editor")} className="flex py-2.5 px-4 items-center gap-2 rounded bg-[#0098E8] text-white font-inter text-sm hover:bg-[#0088D8] transition-colors w-auto!">
						Drag and Drop Editor
					</Button>
				</div>
			</div>
			<div className="flex p-4 flex-col gap-4 self-stretch rounded-xl border border-[#DFE1E7] bg-[#F8FAFB]">
				<div className="flex items-start gap-3">
					<Icon name="convert" width={24} height={24} color="#0098E8" />
					<div className="flex flex-col gap-1">
						<span className="text-[#1D1F2C] font-inter text-2xl font-medium leading-[100%]">Your saved templates</span>
						<span className="text-[#4A4C56] font-inter text-sm font-normal leading-[150%] tracking-[0.28px]">Start building your email using a previously saved template.</span>
					</div>
				</div>
				<TemplatesList onTemplateSelect={handleTemplateSelect} />
			</div>
		</div>
	);
}