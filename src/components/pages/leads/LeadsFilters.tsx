"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { FilterDropdown } from "@/components/ui/FilterDropdown";
import { LimitSelector } from "@/components/ui/LimitSelector";

interface LeadsFiltersProps {
	searchQuery: string;
	onSearchChange: (val: string) => void;
	onSearchSubmit: () => void;
	sourceFilter: string;
	onSourceChange: (val: string) => void;
	priorityFilter: string;
	onPriorityChange: (val: string) => void;
	uniqueSources: string[];
	limit?: number;
	onLimitChange?: (val: number) => void;
	limitOptions?: { value: string; label: string }[];
}

const PRIORITY_OPTIONS = [
	{ value: "LOW", label: "Low" },
	{ value: "MEDIUM", label: "Medium" },
	{ value: "HIGH", label: "High" },
	{ value: "URGENT", label: "Urgent" },
];

export function LeadsFilters({
	searchQuery,
	onSearchChange,
	onSearchSubmit,
	sourceFilter,
	onSourceChange,
	priorityFilter,
	onPriorityChange,
	uniqueSources,
	limit = 10,
	onLimitChange,
	limitOptions
}: LeadsFiltersProps) {
	const [inputValue, setInputValue] = useState(searchQuery);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			onSearchChange(inputValue);
			onSearchSubmit();
		}
	};

	const handleSearchClick = () => {
		onSearchChange(inputValue);
		onSearchSubmit();
	};

	return (
		<div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap justify-between">
			<div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
				<div className="relative flex-1 min-w-[200px] max-w-[400px]">
					<input
						type="text"
						placeholder="Search leads..."
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						onKeyDown={handleKeyDown}
						className="w-full pl-4 pr-12 py-3 border border-[#E8E8E9] rounded-lg bg-white text-sm text-[#1B1B1B] placeholder-[#777980] font-inter outline-none focus:border-[#0098E8]"
					/>
					<button
						type="button"
						onClick={handleSearchClick}
						className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md bg-[#0098E8] text-white hover:bg-[#0088D8] transition-colors"
					>
						<Search size={16} />
					</button>
				</div>

				<FilterDropdown
					label="All sources"
					options={uniqueSources.map((s) => ({ value: s, label: s }))}
					value={sourceFilter}
					onChange={onSourceChange}
					scrollable
					maxHeight={200}
				/>

				<FilterDropdown
					label="All Priorities"
					options={PRIORITY_OPTIONS}
					value={priorityFilter}
					onChange={onPriorityChange}
				/>
			</div>


			<LimitSelector
				limit={limit}
				onLimitChange={onLimitChange || (() => { })}
				options={limitOptions}
			/>
		</div>
	);
}