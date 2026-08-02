'use client';

import { useMemo } from 'react';
import { useGetStageSummaryQuery, useGetStageBreakdownQuery, useGetLeadSourcesQuery } from '@/services/reports.api';
import { LeadConversionStats } from './LeadConversionStats';
import { LeadStageBreakdownChart } from './LeadStageBreakdownChart';
import { LeadSourcesChart } from './LeadSourcesChart';
import { ExportDropdown } from '@/components/ui/ExportDropdown';
import { useExportExcel } from '@/hooks/useExportExcel';
import { toast } from 'react-toastify';

interface Props {
    startDate: string;
    endDate: string;
}

export function LeadConversionContent({ startDate, endDate }: Props) {
    const { data: summary, isLoading: summaryLoading } = useGetStageSummaryQuery({
        stageName: 'Converted', startDate, endDate,
    });

    const stages = ['Converted', 'Contacted', 'Lost'];
    const { data: breakdown, isLoading: breakdownLoading } = useGetStageBreakdownQuery({ stages });

    const { data: sources, isLoading: sourcesLoading } = useGetLeadSourcesQuery({ startDate, endDate });

    // Prepare data for export
    const exportData = useMemo(() => {
        if (!breakdown) return [];
        return breakdown.map((item) => ({
            stageName: item.stageName,
            count: item.count,
        }));
    }, [breakdown]);

    const exportColumns = useMemo(() => [
        { key: 'stageName', header: 'Stage Name' },
        { key: 'count', header: 'Lead Count' },
    ], []);

    const { handleExport } = useExportExcel({
        data: exportData,
        columns: exportColumns,
        filename: 'lead-conversion-report',
    });

    const handleExportCSV = () => {
        // Use the same data but as CSV
        const csvData = exportData.map(row => `${row.stageName},${row.count}`).join('\n');
        const header = 'Stage Name,Lead Count\n';
        const blob = new Blob([header + csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lead-conversion-report.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('CSV exported successfully');
    };

    if (summaryLoading || breakdownLoading || sourcesLoading) {
        return <div className="flex flex-col gap-6"><div className="h-16 bg-gray-200 animate-pulse rounded" /><div className="h-[420px] bg-gray-100 animate-pulse rounded" /></div>;
    }

    if (!summary || !breakdown || !sources) {
        return <div className="text-gray-500 py-10 text-center">Failed to load data or no data available.</div>;
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h3 className="text-[#1A1C21] font-inter text-lg font-semibold">Lead Conversion</h3>
                <ExportDropdown
                    options={[
                        { label: 'Export as Excel (.xlsx)', onClick: () => handleExport() },
                        { label: 'Export as CSV (.csv)', onClick: handleExportCSV },
                    ]}
                />
            </div>
            <LeadConversionStats summary={summary} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <LeadStageBreakdownChart data={breakdown} />
                </div>
                <LeadSourcesChart data={sources} />
            </div>
        </div>
    );
}