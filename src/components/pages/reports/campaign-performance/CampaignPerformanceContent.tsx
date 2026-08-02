'use client';

import { useMemo } from 'react';
import { CampaignHighlightCard } from './CampaignHighlightCard';
import { CampaignPerformanceTable } from './CampaignPerformanceTable';
import { useGetCampaignHighlightsQuery, useGetCampaignTableQuery } from '@/services/reports.api';
import { usePaymentPageState } from '@/hooks/usePaymentPageState';
import { ExportDropdown } from '@/components/ui/ExportDropdown';
import { useExportExcel } from '@/hooks/useExportExcel';
import { toast } from 'react-toastify';

interface Props {
    startDate: string;
    endDate: string;
}

export function CampaignPerformanceContent({ startDate, endDate }: Props) {
    const { page, setPage } = usePaymentPageState();

    const { data: highlights, isLoading: highlightsLoading } = useGetCampaignHighlightsQuery({ startDate, endDate });

    const { data: tableData, isLoading: tableLoading } = useGetCampaignTableQuery({
        page,
        limit: 10,
        startDate,
        endDate,
    });

    const tableDataArray = tableData?.data || [];

    const exportColumns = useMemo(() => [
        { key: 'rowNumber', header: '#' },
        { key: 'campaignName', header: 'Campaign Name' },
        { key: 'sent', header: 'Sent' },
        { key: 'openRate', header: 'Open Rate (%)' },
        { key: 'clickRate', header: 'Click Rate (%)' },
    ], []);

    const { handleExport } = useExportExcel({
        data: tableDataArray,
        columns: exportColumns,
        filename: 'campaign-performance-report',
    });

    const handleExportCSV = () => {
        if (tableDataArray.length === 0) {
            toast.warning('No data to export');
            return;
        }
        const header = '#,Campaign Name,Sent,Open Rate (%),Click Rate (%)\n';
        const rows = tableDataArray.map(row =>
            `${row.rowNumber},${row.campaignName},${row.sent},${row.openRate},${row.clickRate}`
        ).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'campaign-performance-report.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('CSV exported successfully');
    };

    if (highlightsLoading || tableLoading) {
        return (
            <div className="flex flex-col gap-6">
                <div className="grid grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-xl" />
                    ))}
                </div>
                <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h2 className="text-[#0B1220] font-lora text-xl font-bold">Campaign Performance</h2>
                <ExportDropdown
                    options={[
                        { label: 'Export as Excel (.xlsx)', onClick: () => handleExport() },
                        { label: 'Export as CSV (.csv)', onClick: handleExportCSV },
                    ]}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {highlights?.map((h, i) => (
                    <CampaignHighlightCard key={h.id} highlight={h} index={i} />
                ))}
            </div>

            <CampaignPerformanceTable
                data={tableDataArray}
                currentPage={page}
                totalPages={tableData?.meta.totalPages || 1}
                totalItems={tableData?.meta.totalItems || 0}
                onPageChange={setPage}
            />
        </div>
    );
}