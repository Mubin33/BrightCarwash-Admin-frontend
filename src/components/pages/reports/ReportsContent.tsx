'use client';

import { useMemo } from 'react';
import { FilterDropdown } from '@/components/ui/FilterDropdown';
import { ReportTabSwitcher } from './lead-conversion/ReportTabSwitcher';
import { LeadConversionContent } from './lead-conversion/LeadConversionContent';
import { useReportState } from '@/hooks/useReportState';
import { format, subDays, subMonths } from 'date-fns';
import { CampaignPerformanceContent } from './campaign-performance/CampaignPerformanceContent';
import { MemberActivityContent } from './member-activity/MemberActivityContent';

const PERIOD_OPTIONS = [
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'last6months', label: 'Last 6 Months' },
    { value: 'thisYear', label: 'This Year' },
];

export function ReportsContent() {
    const { tab, period, setTab, setPeriod } = useReportState();

    const { startDate, endDate } = useMemo(() => {
        const now = new Date();
        if (period === 'last30days') {
            return { startDate: format(subDays(now, 30), "yyyy-MM-dd'T'00:00:00'Z'"), endDate: format(now, "yyyy-MM-dd'T'23:59:59'Z'") };
        }
        if (period === 'last6months') {
            return { startDate: format(subMonths(now, 6), "yyyy-MM-dd'T'00:00:00'Z'"), endDate: format(now, "yyyy-MM-dd'T'23:59:59'Z'") };
        }
        return { startDate: format(new Date(now.getFullYear(), 0, 1), "yyyy-MM-dd'T'00:00:00'Z'"), endDate: format(now, "yyyy-MM-dd'T'23:59:59'Z'") };
    }, [period]);

    return (
        <div className="flex flex-col gap-6 w-full p-4">
            <div className="flex justify-between items-center">
                <h2 className="text-[#0B1220] font-lora text-xl font-bold">Reports & Analytics</h2>
                <FilterDropdown
                    label="Period"
                    options={PERIOD_OPTIONS}
                    value={period}
                    onChange={setPeriod}
                />
            </div>
            <ReportTabSwitcher activeTab={tab} onChange={setTab} />
            {tab === 'lead-conversion' && <LeadConversionContent startDate={startDate} endDate={endDate} />}
            {tab === 'campaign-performance' && <CampaignPerformanceContent startDate={startDate} endDate={endDate} />}
            {tab === 'member-activity' && <MemberActivityContent startDate={startDate} endDate={endDate} />}
        </div>
    );
}