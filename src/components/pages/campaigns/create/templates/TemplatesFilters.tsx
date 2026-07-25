"use client";

import { Search } from "lucide-react";
import { LimitSelector } from "@/components/ui/LimitSelector";



interface TemplatesFiltersProps {
    searchInput: string;
    onSearchChange: (value: string) => void;
    onSearchSubmit: () => void;
    limit: number;
    onLimitChange: (value: number) => void;
}

export function TemplatesFilters({
    searchInput,
    onSearchChange,
    onSearchSubmit,
    limit,
    onLimitChange,
}: TemplatesFiltersProps) {
    return (
        <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-[400px]">
                <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchInput}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onSearchSubmit()}
                    className="w-full pl-4 pr-12 py-2.5 border border-[#E8E8E9] rounded-lg bg-white text-sm text-[#1B1B1B] placeholder-[#777980] font-inter outline-none focus:border-[#0098E8]"
                />
                <button
                    type="button"
                    onClick={onSearchSubmit}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md bg-[#0098E8] text-white hover:bg-[#0088D8] transition-colors"
                >
                    <Search size={16} />
                </button>
            </div>

            <LimitSelector
                limit={limit}
                onLimitChange={onLimitChange}
            />
        </div>
    );
}