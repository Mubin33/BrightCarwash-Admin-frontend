import { TemplatesList } from "@/components/pages/campaigns/create/templates/TemplatesList";

export default function TemplatesPage() {
    return (
        <div className="flex flex-col gap-6 w-full">
            <div className="flex justify-between items-end gap-3">
                <h2 className="text-[#0B1220] font-lora text-xl font-bold leading-[100%]">
                    Templates
                </h2>
            </div>
            <TemplatesList />
        </div>
    );
}