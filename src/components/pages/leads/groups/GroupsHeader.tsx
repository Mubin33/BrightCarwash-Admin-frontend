"use client";

import { Search } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

interface GroupsHeaderProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    onExport: () => void;
    exportDisabled: boolean;
    onAddGroup: () => void;
}

export function GroupsHeader({
    searchQuery,
    onSearchChange,
    onExport,
    exportDisabled,
    onAddGroup,
}: GroupsHeaderProps) {
    return (
        <div className="flex items-center gap-3 flex-wrap w-full">
            <div className="flex px-4 py-3 items-center gap-3 rounded-lg border border-[#E8E8E9] bg-white max-w-[400px] flex-1 min-w-[200px]">
                <Search size={20} className="text-[#777980] shrink-0" />
                <input
                    type="text"
                    placeholder="Search groups..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="flex-1 border-none outline-none text-sm text-[#1B1B1B] placeholder-[#777980] font-inter bg-transparent"
                />
            </div>

            <div className="flex items-center gap-2 sm:gap-3 ml-auto">
                <Button
                    variant="outline"
                    className="flex py-2 sm:py-2.5 px-3 sm:px-4 justify-center items-center gap-1.5 sm:gap-2 rounded border border-[#DFE1E7] text-[#1B1B1B] font-inter text-xs sm:text-sm font-normal whitespace-nowrap"
                    onClick={onExport}
                    disabled={exportDisabled}
                >
                    <Icon name="export" width={14} height={14} className="sm:w-4 sm:h-4" /> Export
                </Button>

                <Button
                    className="flex py-2 sm:py-2.5 px-3 sm:px-4 justify-center items-center gap-1.5 sm:gap-2 rounded bg-[#0098E8] text-white font-inter text-xs sm:text-sm font-normal hover:bg-[#0088D8] transition-colors whitespace-nowrap"
                    onClick={onAddGroup}
                >
                    <Icon name="plus" width={14} height={14} className="sm:w-4 sm:h-4" /> New Group
                </Button>
            </div>
        </div>
    );
}