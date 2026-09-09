'use client';

import { useMemo } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import type { CampaignTableRow } from '@/types/reports';
import type { Column } from '@/components/ui/DataTable';

interface Props {
    data: CampaignTableRow[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
}

export function CampaignPerformanceTable({ data, currentPage, totalPages, totalItems, onPageChange }: Props) {
    const columns: Column<CampaignTableRow>[] = useMemo(
        () => [
            { key: 'rowNumber', header: '#', render: (row) => <span className="text-[#777980] font-inter text-sm">{row.rowNumber}</span> },
            { key: 'campaignName', header: 'Campaign Name', render: (row) => <span className="text-[#1B1B1B] font-inter text-sm font-medium">{row.campaignName}</span> },
            { key: 'sent', header: 'Sent', render: (row) => <span className="text-[#1B1B1B] font-inter text-sm">{row.sent.toLocaleString()}</span> },
            { key: 'openRate', header: 'Open Rate', render: (row) => <span className="text-[#0098E8] font-inter text-sm font-medium">{row.openRate}%</span> },
            { key: 'clickRate', header: 'Click Rate', render: (row) => <span className="text-[#006F1F] font-inter text-sm font-medium">{row.clickRate}%</span> },
        ],
        [],
    );

    return (
        <div className="flex flex-col gap-4 w-full">
            <DataTable columns={columns} data={data} rowKey={(row) => row.id} className="w-full border border-[#E8E8E9] rounded-lg" />
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} totalItems={totalItems} itemsPerPage={10} />
        </div>
    );
}