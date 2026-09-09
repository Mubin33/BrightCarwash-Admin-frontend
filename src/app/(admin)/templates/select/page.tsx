"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TemplatesList } from "@/components/pages/campaigns/create/templates/TemplatesList";
import type { Template } from "@/types/template";

export default function SelectTemplatePage() {
    const router = useRouter();

    const handleTemplateSelect = (template: Template) => {
        // Return to campaign create with template data
        router.push(`/campaigns/create?templateId=${template.id}&templateName=${encodeURIComponent(template.name)}`);
    };

    return (
        <div className="flex flex-col gap-6 w-full">
            <div className="flex items-center gap-3">
                <Button
                    variant="icon"
                    onClick={() => router.back()}
                    className="flex items-center text-[#777980] hover:text-[#1B1B1B] transition-colors p-0"
                >
                    <ChevronLeft size={20} />
                </Button>
                <h2 className="text-[#0B1220] font-lora text-xl font-bold leading-[100%]">
                    Select a Template
                </h2>
            </div>
            <TemplatesList onTemplateSelect={handleTemplateSelect} />
        </div>
    );
}