'use client';

import { useState, useCallback } from 'react';
import { MetricCard } from '@/components/ui/MetricCard';
import { PaymentsTable } from '@/components/pages/payments/PaymentsTable';
import { ExportDropdown } from '@/components/ui/ExportDropdown';
import {
	useGetPaymentStatsQuery,
	useGetPaymentTransactionsQuery,
} from '@/services/payment.api';
import { usePaymentPageState } from '@/hooks/usePaymentPageState';
import { useExportExcel } from '@/hooks/useExportExcel';
import { useExportCSV } from '@/hooks/useExportCSV';
import { mapStatsToMetrics, PAYMENT_EXPORT_COLUMNS } from '@/lib/payment-utils';
import { toast } from 'react-toastify';

export function PaymentsContent() {
	const { page, search, status, setPage, setSearch, setStatus } =
		usePaymentPageState();
	const [searchSubmitted, setSearchSubmitted] = useState(false);
	const [searchValue, setSearchValue] = useState(search);

	const { data: stats, isLoading: statsLoading } = useGetPaymentStatsQuery();
	const {
		data: txData,
		isLoading: txLoading,
		isFetching,
		error: txError,
	} = useGetPaymentTransactionsQuery({
		page,
		limit: 10,
		search: searchSubmitted ? searchValue : undefined,
		status,
	});

	const { exportCSV } = useExportCSV();
	const { handleExport } = useExportExcel({
		data: txData?.transactions || [],
		columns: PAYMENT_EXPORT_COLUMNS,
		filename: 'payments-export',
		endpoint: '/payment-transaction/export/excel',
		params: { search, status },
	});

	const metrics = stats ? mapStatsToMetrics(stats) : [];

	const handleExportExcel = async () => {
		try {
			await handleExport();
			toast.success('Excel exported');
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : 'Excel export failed');
		}
	};

	const handleExportCSV = async () => {
		try {
			await exportCSV(search, status);
			toast.success('CSV exported');
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : 'CSV export failed');
		}
	};


	const handleSearchSubmit = useCallback(() => {
		setSearch(searchValue);
		setSearchSubmitted(true);
		setPage(1);
	}, [searchValue, setSearch, setPage]);


	const handleSearchChange = useCallback((value: string) => {
		setSearchValue(value);
		setSearchSubmitted(false);
	}, []);

	if (statsLoading || (txLoading && !txData)) {
		return (
			<div className="flex flex-col gap-6 w-full">
				<div className="flex justify-between items-end">
					<div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
					<div className="h-9 w-24 bg-gray-200 rounded animate-pulse" />
				</div>
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
					{[...Array(4)].map((_, i) => (
						<div key={i} className="h-35 bg-gray-100 rounded-lg animate-pulse" />
					))}
				</div>
				<div className="h-75 bg-gray-100 rounded-lg animate-pulse" />
			</div>
		);
	}

	if (txError) {
		return (
			<div className="flex items-center justify-center py-12 text-[#FF4345] font-inter">
				Failed to load payments.
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6 w-full">
			<div className="flex justify-between items-end gap-3">
				<h2 className="text-[#0B1220] font-lora text-xl font-bold leading-[100%]">
					Payments Overview
				</h2>
				<div className="flex items-center gap-3 shrink-0">
					<ExportDropdown
						options={[
							{ label: 'Export as Excel (.xlsx)', onClick: handleExportExcel },
							{ label: 'Export as CSV (.csv)', onClick: handleExportCSV },
						]}
					/>
				</div>
			</div>

			<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
				{metrics.map((m) => (
					<MetricCard key={m.id} data={m} />
				))}
			</div>

			<PaymentsTable
				payments={txData?.transactions || []}
				meta={txData?.meta}
				search={searchValue}
				status={status}
				onSearchChange={handleSearchChange}
				onSearchSubmit={handleSearchSubmit}
				onStatusChange={setStatus}
				currentPage={page}
				onPageChange={setPage}
				isLoading={isFetching}
			/>
		</div>
	);
}
