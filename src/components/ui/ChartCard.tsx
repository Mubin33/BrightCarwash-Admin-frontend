'use client';

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { ApexAxisChartSeries, ApexNonAxisChartSeries } from 'apexcharts';

interface ChartCardProps {
    options: ApexCharts.ApexOptions;
    series: ApexAxisChartSeries | ApexNonAxisChartSeries;
    type: 'area' | 'bar' | 'donut' | 'line';
    height?: number;
    className?: string;
}

const ApexChart = dynamic(() => import('react-apexcharts'), {
    ssr: false,
    loading: () => <div className="h-full min-h-[200px] bg-gray-100 animate-pulse rounded-lg w-full" />,
});

export function ChartCard({ options, series, type, height = 350, className }: ChartCardProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    if (!mounted) return <div className={`bg-gray-100 animate-pulse rounded-lg ${className}`} style={{ height }} />;

    return (
        <Suspense fallback={<div className="bg-gray-100 animate-pulse rounded-lg" style={{ height }} />}>
            <ApexChart options={options} series={series} type={type} height={height} width="100%" />
        </Suspense>
    );
}