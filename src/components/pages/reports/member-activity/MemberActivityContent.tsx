'use client';

import { useMemo } from 'react';
import { MemberActivityStats } from './MemberActivityStats';
import { MemberActivityTable } from './MemberActivityTable';
import { useGetMemberHighlightsQuery, useGetMemberTableQuery } from '@/services/reports.api';
import { usePaymentPageState } from '@/hooks/usePaymentPageState';
import { ExportDropdown } from '@/components/ui/ExportDropdown';
import { useExportExcel } from '@/hooks/useExportExcel';
import { toast } from 'react-toastify';

interface Props {
    startDate: string;
    endDate: string;
}

export function MemberActivityContent({ startDate, endDate }: Props) {
    const { page, setPage } = usePaymentPageState();

    const { data: highlights, isLoading: highlightsLoading } = useGetMemberHighlightsQuery({ startDate, endDate });
    const { data: tableData, isLoading: tableLoading } = useGetMemberTableQuery({ page, limit: 10 });

    const tableDataArray = tableData?.data || [];

    const exportColumns = useMemo(() => [
        { key: 'firstName', header: 'First Name' },
        { key: 'lastName', header: 'Last Name' },
        { key: 'role', header: 'Role' },
        { key: 'assigned', header: 'Assigned' },
        { key: 'converted', header: 'Converted' },
        { key: 'contacted', header: 'Contacted' },
        { key: 'lost', header: 'Lost' },
    ], []);

    // Prepare data for export with proper formatting
    const exportData = useMemo(() => {
        return tableDataArray.map((row) => ({
            firstName: row.firstName,
            lastName: row.lastName,
            role: row.role.join(', '),
            assigned: row.assigned,
            converted: row.stageBreakdown['Converted'] || 0,
            contacted: row.stageBreakdown['Contacted'] || 0,
            lost: row.stageBreakdown['Lost'] || 0,
        }));
    }, [tableDataArray]);

    const { handleExport } = useExportExcel({
        data: exportData,
        columns: exportColumns,
        filename: 'member-activity-report',
    });

    const handleExportCSV = () => {
        if (exportData.length === 0) {
            toast.warning('No data to export');
            return;
        }
        const header = 'First Name,Last Name,Role,Assigned,Converted,Contacted,Lost\n';
        const rows = exportData.map(row =>
            `${row.firstName},${row.lastName},${row.role},${row.assigned},${row.converted},${row.contacted},${row.lost}`
        ).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'member-activity-report.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('CSV exported successfully');
    };

    if (highlightsLoading || tableLoading) {
        return (
            <div className="flex flex-col gap-6">
                <div className="grid grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-28 bg-gray-100 animate-pulse rounded-lg" />
                    ))}
                </div>
                <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h2 className="text-[#0B1220] font-lora text-xl font-bold">Member Activity</h2>
                <ExportDropdown
                    options={[
                        { label: 'Export as Excel (.xlsx)', onClick: () => handleExport() },
                        { label: 'Export as CSV (.csv)', onClick: handleExportCSV },
                    ]}
                />
            </div>
            <MemberActivityStats data={highlights!} />
            <MemberActivityTable
                data={tableDataArray}
                currentPage={page}
                totalPages={tableData?.meta.totalPages || 1}
                totalItems={tableData?.meta.totalItems || 0}
                onPageChange={setPage}
            />
        </div>
    );
}