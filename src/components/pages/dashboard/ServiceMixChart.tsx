'use client';

import { useMemo } from 'react';
import { ChartCard } from '@/components/ui/ChartCard';
import type { ServiceMixItem } from '@/types/dashboard';

interface Props {
  data: ServiceMixItem[];
}

const donutColors = ['#0098E8', '#B23730', '#777980', '#1B1B1B', '#DFE1E7'];

export function ServiceMixChart({ data }: Props) {
  const labels = data.map((d) => d.name);
  const series = data.map((d) => d.percentage);

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
                label: 'Services',
                formatter: () => `${series.reduce((a, b) => a + b, 0)}%`,
              },
            },
          },
        },
      },
      legend: { show: false },
      dataLabels: { enabled: false },
      responsive: [
        {
          breakpoint: 1024,
          options: {
            chart: { width: '100%' },
            plotOptions: {
              pie: {
                donut: {
                  size: '60%',
                },
              },
            },
          },
        },
        {
          breakpoint: 480,
          options: {
            chart: { width: '100%' },
            plotOptions: {
              pie: {
                donut: {
                  size: '65%',
                },
              },
            },
          },
        },
      ],
    }),
    [labels, series],
  );

  return (
    <div className="p-4 rounded-lg border border-[#DFE1E7] bg-white flex flex-col gap-3 h-full">
      <h3 className="text-[#1A1C21] font-inter text-lg font-semibold shrink-0">
        Service Distribution
      </h3>
      <div className="flex flex-row lg:flex-col items-center justify-center lg:justify-start gap-4 flex-1 min-h-0">
        {/* Donut */}
        <div className="w-1/2 lg:w-full flex justify-center items-center">
          <ChartCard
            options={options}
            series={series}
            type="donut"
            height={220}
          />
        </div>
        {/* Legend - hidden on mobile, shown on lg+ */}
        <div className="hidden lg:block w-1/2 lg:w-full max-h-28 overflow-auto shrink-0">
          <div className="flex flex-col lg:flex-row lg:flex-wrap lg:justify-center gap-2 lg:gap-3">
            {data.map((item, idx) => (
              <div
                key={item.name}
                className="flex items-center gap-2 text-sm bg-[#F8FAFB] rounded-lg px-3 py-1.5"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: donutColors[idx % donutColors.length] }}
                />
                <span className="text-[#1B1B1B] truncate max-w-[100px] lg:max-w-[120px]">
                  {item.name}
                </span>
                <span className="text-[#777980] font-medium tabular-nums">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}