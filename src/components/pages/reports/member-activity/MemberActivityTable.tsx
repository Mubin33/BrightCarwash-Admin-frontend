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
    const stageNames = useMemo(() => {
        const stages = new Set<string>();
        data.forEach((row) => {
            if (row.stageBreakdown) {
                Object.keys(row.stageBreakdown).forEach((stage) => stages.add(stage));
            }
        });
        return Array.from(stages);
    }, [data]);

    const columns: Column<MemberTableRow>[] = useMemo(
        () => [
            {
                key: 'memberName',
                header: 'Member Name',
                render: (row) => (
                    <span className="text-[#1B1B1B] font-inter text-sm font-medium whitespace-nowrap">
                        {[row.firstName, row.lastName].filter(Boolean).join(' ') || '—'}
                    </span>
                ),
            },
            {
                key: 'role',
                header: 'Role',
                render: (row) => (
                    <span className="text-[#777980] font-inter text-sm capitalize whitespace-nowrap">
                        {row.role && row.role.length > 0 ? row.role.join(', ') : '—'}
                    </span>
                ),
            },
            {
                key: 'assigned',
                header: 'Assigned',
                render: (row) => (
                    <span className="text-[#1B1B1B] font-inter text-sm">{row.assigned ?? 0}</span>
                ),
            },
            ...stageNames.map((stage) => {
                const stageLower = stage.toLowerCase();
                let colorClass = 'text-[#1B1B1B]';
                if (stageLower === 'converted') {
                    colorClass = 'text-[#006F1F]';
                } else if (stageLower === 'contacted') {
                    colorClass = 'text-[#FFAF00]';
                } else if (stageLower === 'lost') {
                    colorClass = 'text-[#FF4345]';
                }

                return {
                    key: `stage_${stage}`,
                    header: stage,
                    className: 'whitespace-nowrap',
                    render: (row: MemberTableRow) => (
                        <span className={`${colorClass} font-inter text-sm font-medium`}>
                            {row.stageBreakdown?.[stage] ?? 0}
                        </span>
                    ),
                };
            }),
        ],
        [stageNames],
    );

    return (
        <div className="flex flex-col gap-4 w-full">
            <DataTable columns={columns} data={data} rowKey={(row) => row.id} className="w-full border border-[#E8E8E9] rounded-lg" />
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} totalItems={totalItems} itemsPerPage={10} />
        </div>
    );
}