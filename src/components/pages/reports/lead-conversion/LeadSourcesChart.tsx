'use client';

import { useMemo } from 'react';
import { ChartCard } from '@/components/ui/ChartCard';
import type { LeadSourceItem } from '@/types/reports';

interface Props {
    data: LeadSourceItem[];
}

const donutColors = ['#0098E8', '#B23730', '#777980', '#1B1B1B', '#DFE1E7'];

export function LeadSourcesChart({ data }: Props) {
    const labels = data.map((d) => d.source);
    const series = data.map((d) => d.count);

    const options: ApexCharts.ApexOptions = useMemo(
        () => ({
            chart: { type: 'donut', fontFamily: 'Inter' },
            labels,
            colors: donutColors,
            plotOptions: {
                pie: {
                    donut: {
                        size: '55%',
                        labels: {
                            show: true,
                            total: {
                                show: true,
                                label: 'Total Leads',
                                formatter: () => String(data.reduce((s, i) => s + i.count, 0)),
                            },
                        },
                    },
                },
            },
            legend: { show: false },
            dataLabels: { enabled: false },
        }),
        [labels, series],
    );

    return (
        <div className="p-4 rounded-lg border border-[#DFE1E7] bg-white flex flex-col gap-3">
            <h3 className="text-[#1A1C21] font-inter text-lg font-semibold">
                Lead Sources
            </h3>
            <div className="flex flex-row lg:flex-col items-center gap-4">
                {/* Donut */}
                <div className="w-1/2 lg:w-full flex justify-center">
                    <ChartCard
                        options={options}
                        series={series}
                        type="donut"
                        height={320}
                    />
                </div>
                {/* Legend */}
                <div className="w-1/2 lg:w-full lg:max-h-28 md:max-h-68  overflow-auto">
                    <div className="flex flex-col lg:flex-row lg:flex-wrap lg:justify-center gap-2 lg:gap-3">
                        {data.map((item, idx) => (
                            <div
                                key={item.source}
                                className="flex items-center gap-2 text-sm bg-[#F8FAFB] rounded-lg px-3 py-1.5"
                            >
                                <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                    style={{
                                        backgroundColor:
                                            donutColors[idx % donutColors.length],
                                    }}
                                />
                                <span className="text-[#1B1B1B] truncate max-w-[120px]">
                                    {item.source}
                                </span>
                                <span className="text-[#777980] font-medium tabular-nums">
                                    {item.count}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}