'use client';

import { MetricCard } from '@/components/ui/MetricCard';
import type { MemberActivityHighlights } from '@/types/reports';

interface Props {
    data: MemberActivityHighlights;
}

export function MemberActivityStats({ data }: Props) {
    const metrics = [
        {
            id: 'activeTeamMembers',
            heading: 'Active Team Members',
            value: String(data.activeTeamMembers),
            changePercent: 'Across All Roles',
            changeDirection: 'none' as const,
            vsLabel: '',
        },
        {
            id: 'avgLeadsPerMember',
            heading: 'Avg Leads per Member',
            value: String(data.avgLeadsPerMember),
            changePercent: 'this month',
            changeDirection: 'none' as const,
            vsLabel: '',
        },
        {
            id: 'mostAssignedMember',
            heading: 'Most Assigned Member',
            value: data.mostAssignedMember.name || '—',
            changePercent: `${data.mostAssignedMember.assignedCount} leads`,
            changeDirection: 'up' as const,
            vsLabel: '',
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