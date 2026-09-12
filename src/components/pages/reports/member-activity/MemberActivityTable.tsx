'use client';

import { useMemo } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import type { MemberTableRow } from '@/types/reports';
import type { Column } from '@/components/ui/DataTable';

interface Props {
    data: MemberTableRow[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
}

export function MemberActivityTable({ data, currentPage, totalPages, totalItems, onPageChange }: Props) {
    const columns: Column<MemberTableRow>[] = useMemo(
        () => [
            {
                key: 'memberName',
                header: 'Member Name',
                render: (row) => (
                    <span className="text-[#1B1B1B] font-inter text-sm font-medium">
                        {row.firstName} {row.lastName}
                    </span>
                ),
            },
            {
                key: 'role',
                header: 'Role',
                render: (row) => (
                    <span className="text-[#777980] font-inter text-sm capitalize">
                        {row.role.join(', ')}
                    </span>
                ),
            },
            {
                key: 'assigned',
                header: 'Assigned',
                render: (row) => (
                    <span className="text-[#1B1B1B] font-inter text-sm">{row.assigned}</span>
                ),
            },
            {
                key: 'converted',
                header: 'Converted',
                render: (row) => (
                    <span className="text-[#006F1F] font-inter text-sm font-medium">
                        {row.stageBreakdown['Converted'] || 0}
                    </span>
                ),
            },
            {
                key: 'contacted',
                header: 'Contacted',
                render: (row) => (
                    <span className="text-[#FFAF00] font-inter text-sm font-medium">
                        {row.stageBreakdown['Contacted'] || 0}
                    </span>
                ),
            },
            {
                key: 'lost',
                header: 'Lost',
                render: (row) => (
                    <span className="text-[#FF4345] font-inter text-sm font-medium">
                        {row.stageBreakdown['Lost'] || 0}
                    </span>
                ),
            },
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