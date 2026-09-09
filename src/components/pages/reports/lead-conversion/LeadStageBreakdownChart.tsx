'use client';

import { useMemo } from 'react';
import { ChartCard } from '@/components/ui/ChartCard';
import type { StageBreakdownItem } from '@/types/reports';

interface Props {
    data: StageBreakdownItem[];
}

const stageColors: Record<string, string> = {
    Converted: '#0f7a3c',
    Contacted: '#f5a623',
    Lost: '#f74646',
};

export function LeadStageBreakdownChart({ data }: Props) {
    const categories = data.map((d) => d.stageName);
    const series = [{ name: 'Leads', data: data.map((d) => d.count) }];
    const colors = data.map((d) => stageColors[d.stageName] || '#0098E8');

    const options: ApexCharts.ApexOptions = useMemo(
        () => ({
            chart: {
                type: 'bar',
                toolbar: { show: false },
                fontFamily: 'Inter, sans-serif',
            },
            plotOptions: { bar: { borderRadius: 4, distributed: true, columnWidth: '40%' } },
            grid: { borderColor: '#e5e7eb', strokeDashArray: 3 },
            xaxis: {
                categories,
                axisBorder: { show: false },
                axisTicks: { show: false },
                labels: { style: { colors: '#6b7280', fontSize: '14px' } },
            },
            yaxis: {
                labels: {
                    style: { colors: '#9ca3af', fontSize: '13px' },
                    formatter: (val: number) => val.toLocaleString('en-US'),
                },
            },
            colors,
            legend: { show: false },
        }),
        [categories, colors],
    );

    return (
        <div className="rounded-2xl border border-[#DFE1E7] bg-white p-6 shadow-sm">
            <h3 className="text-[#1A1C21] font-inter text-lg font-semibold">
                Lead Stage Breakdown
            </h3>
            <div className="mt-6 min-w-[300px] h-[420px]">
                <ChartCard options={options} series={series} type="bar" height={420} />
            </div>
        </div>
    );
}