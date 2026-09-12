"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface CampaignBreadcrumbProps {
    isEdit: boolean;
    currentStep: number;
    campaignName: string;
    onBackToStep1?: () => void;
}

export function CampaignBreadcrumb({
    isEdit,
    currentStep,
    campaignName,
    onBackToStep1,
}: CampaignBreadcrumbProps) {
    return (
        <div className="flex items-center gap-2 text-sm text-[#777980] font-inter whitespace-nowrap">
            <Link href="/campaigns" className="hover:text-[#0098E8] transition-colors">
                Campaigns
            </Link>
            <ChevronRight size={14} />

            {currentStep >= 3 ? (
                <>
                    <button
                        onClick={onBackToStep1}
                        className="hover:text-[#0098E8] transition-colors cursor-pointer bg-transparent border-none p-0 text-sm font-inter"
                    >
                        {isEdit ? "Edit Campaign" : "Create Campaign"}
                    </button>
                    <ChevronRight size={14} />
                    <span className="text-[#1B1B1B] truncate max-w-[150px]">
                        {campaignName || "Untitled"}
                    </span>
                    <ChevronRight size={14} />
                    <span className="text-[#1B1B1B]">Design Template</span>
                </>
            ) : currentStep >= 2 ? (
                <>
                    <button
                        onClick={onBackToStep1}
                        className="hover:text-[#0098E8] transition-colors cursor-pointer bg-transparent border-none p-0 text-sm font-inter"
                    >
                        {isEdit ? "Edit Campaign" : "Create Campaign"}
                    </button>
                    <ChevronRight size={14} />
                    <span className="text-[#1B1B1B] truncate max-w-[150px]">
                        {campaignName || "Untitled"}
                    </span>
                </>
            ) : (
                <span className="text-[#1B1B1B]">
                    {isEdit ? "Edit Campaign" : "Create Campaign"}
                </span>
            )}
        </div>
    );
}