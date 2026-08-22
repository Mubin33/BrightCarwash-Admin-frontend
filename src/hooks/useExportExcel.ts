'use client';

import { useCallback } from 'react';
import { exportToExcel } from '@/lib/excel-export';
import { toast } from 'react-toastify';
import { formatCurrency } from '@/lib/payment-utils';
import { getAccessToken } from '@/lib/auth-client';
import { APP_CONFIG } from '@/configs/app.config';

interface UseExportExcelProps<T> {
	data: T[];
	columns: { key: string; header: string }[];
	filename: string;
	format?: 'xlsx' | 'csv';
	endpoint?: string;
	params?: Record<string, string | undefined>;
}

export function useExportExcel<T>({
	data,
	columns,
	filename,
	format = 'xlsx',
	endpoint,
	params,
}: UseExportExcelProps<T>) {
	const handleExport = useCallback(
		async (selectedIds?: Set<string>) => {
			if (endpoint) {
				const token = getAccessToken();
				if (!token) throw new Error('Not authenticated');

				const query = new URLSearchParams();
				Object.entries(params ?? {}).forEach(([key, value]) => {
					if (value) query.set(key, value);
				});
				const url = `${APP_CONFIG.API_BASE_URL}${endpoint}?${query.toString()}`;
				const response = await fetch(url, {
					headers: { Authorization: `Bearer ${token}` },
				});
				if (!response.ok) throw new Error('Excel export failed');

				const blob = await response.blob();
				const contentDisposition = response.headers.get('Content-Disposition');
				const match = contentDisposition?.match(/filename="?([^";]+)"?/i);
				const downloadUrl = window.URL.createObjectURL(blob);
				const link = document.createElement('a');
				link.href = downloadUrl;
				link.download = match?.[1] || `${filename}.xlsx`;
				document.body.appendChild(link);
				link.click();
				link.remove();
				window.URL.revokeObjectURL(downloadUrl);
				return;
			}

			const dataToExport =
				selectedIds && selectedIds.size > 0
					? data.filter((item) =>
						selectedIds.has((item as Record<string, unknown>).id as string),
					)
					: data;

			if (dataToExport.length === 0) {
				toast.warning('No data to export');
				return;
			}

			const formattedData = dataToExport.map((item) => {
				const record = item as Record<string, unknown>;
				if ('amount' in record && 'currency' in record) {
					return {
						...record,
						amount: formatCurrency(record.amount as number, record.currency as string),
					};
				}
				return record;
			});

			exportToExcel(
				formattedData as Record<string, unknown>[],
				columns,
				`${filename}.${format === 'csv' ? 'csv' : 'xlsx'}`,
			);
			toast.success(`Exported ${dataToExport.length} ${filename}`);
		},
		[data, columns, filename, format, endpoint, params],
	);

	return { handleExport };
}
