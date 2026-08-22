"use client";

import { useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { FilterDropdown } from "@/components/ui/FilterDropdown";
import { paymentsColumns } from "@/components/pages/payments/PaymentsColumns";
import type { PaymentTransaction } from "@/types/payment";
import { Search } from "lucide-react";

interface Props {
	payments: PaymentTransaction[];
	meta?: { totalItems: number; itemsPerPage: number; totalPages: number; currentPage: number; hasNextPage: boolean; hasPreviousPage: boolean } | null;
	search: string;
	status: string;
	onSearchChange: (value: string) => void;
	onSearchSubmit: () => void;
	onStatusChange: (value: string) => void;
	currentPage: number;
	onPageChange: (page: number) => void;
	isLoading?: boolean;
}

const ITEMS_PER_PAGE = 10;

const STATUS_OPTIONS = [
	{ value: "PAID", label: "Paid" },
	{ value: "FAILED", label: "Failed" },
];

export function PaymentsTable({
	payments,
	meta,
	search,
	status,
	onSearchChange,
	onSearchSubmit,
	onStatusChange,
	currentPage,
	onPageChange,
	isLoading = false,
}: Props) {
	const [inputValue, setInputValue] = useState(search);
	const totalPages = meta?.totalPages || 1;
	const totalItems = meta?.totalItems || payments.length;
	const hasData = payments.length > 0;
	const showLoadingOverlay = isLoading && hasData;

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
		<div className="flex flex-col gap-4 w-full whitespace-nowrap">
			<div className="flex justify-between items-center gap-4">
				<div className="relative flex-1 max-w-[400px]">
					<input
						type="text"
						placeholder="Search payments..."
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
					label="All Status"
					options={STATUS_OPTIONS}
					value={status}
					onChange={onStatusChange}
					dropdownOffsetX={-50}
				/>
			</div>

			<div className="w-full border border-[#E8E8E9] rounded-lg overflow-visible relative">
				{showLoadingOverlay && (
					<div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-lg">
						<div className="flex flex-col items-center gap-2">
							<div className="w-8 h-8 border-2 border-[#0098E8] border-t-transparent rounded-full animate-spin" />
							<span className="text-[#777980] font-inter text-sm">Loading...</span>
						</div>
					</div>
				)}
				<DataTable
					columns={paymentsColumns}
					data={payments}
					rowKey={(row) => row.id}
					className="w-full"
				/>
			</div>

			<Pagination
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={onPageChange}
				totalItems={totalItems}
				itemsPerPage={ITEMS_PER_PAGE}
				isLoading={isLoading}
			/>
		</div>
	);
}