'use client';

import { MetricCard } from '@/components/ui/MetricCard';
import type { StageSummaryData } from '@/types/reports';

interface Props {
    summary: StageSummaryData;
}

export function LeadConversionStats({ summary }: Props) {
    const metrics = [
        {
            id: 'totalLeads',
            heading: 'Total Leads',
            value: String(summary.totalLeads.current),
            changePercent: `${summary.totalLeads.percentageChange}%`,
            changeDirection: summary.totalLeads.percentageChange >= 0 ? 'up' as const : 'down' as const,
            vsLabel: 'vs last period',
        },
        {
            id: 'converted',
            heading: 'Converted',
            value: String(summary.stagedLeads.current),
            changePercent: `${summary.stagedLeads.percentageChange}%`,
            changeDirection: summary.stagedLeads.percentageChange >= 0 ? 'up' as const : 'down' as const,
            vsLabel: 'vs last period',
        },
        {
            id: 'conversionRate',
            heading: 'Conversion Rate',
            value: `${summary.stagedLeadRate.current}%`,
            changePercent: `${summary.stagedLeadRate.pointDifference > 0 ? '+' : ''}${summary.stagedLeadRate.pointDifference} pts`,
            changeDirection: summary.stagedLeadRate.pointDifference >= 0 ? 'up' as const : 'down' as const,
            vsLabel: 'vs last period',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {metrics.map((m) => (
                <MetricCard key={m.id} data={m} />
            ))}
        </div>
    );
}