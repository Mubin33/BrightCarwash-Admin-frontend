import { MetricsRow } from "@/components/pages/dashboard/MetricsRow";
import type { MetricCard } from "@/types/dashboard";
import type { DashboardMetricsResponse } from "@/types/dashboard";

interface DashboardMetricsProps {
    data: DashboardMetricsResponse["data"];
}

export function DashboardMetrics({ data }: DashboardMetricsProps) {
    const { keyMetrics } = data;

    const metrics: MetricCard[] = [
        {
            id: "total-leads",
            heading: "Total Leads",
            value: String(keyMetrics.totalLeads.current),
            changePercent: `${keyMetrics.totalLeads.percentageChange}%`,
            changeDirection: keyMetrics.totalLeads.percentageChange >= 0 ? "up" : "down",
            vsLabel: "vs last period",
        },
        {
            id: "new-this-week",
            heading: "New This Week",
            value: String(keyMetrics.newThisWeek.current),
            changePercent: `${keyMetrics.newThisWeek.percentageChange}%`,
            changeDirection: keyMetrics.newThisWeek.percentageChange >= 0 ? "up" : "down",
            vsLabel: "vs last period",
        },
        {
            id: "conversion-rate",
            heading: "Conversion Rate",
            value: `${keyMetrics.conversionSuccessRate.current}%`,
            changePercent: `${keyMetrics.conversionSuccessRate.percentageChange}%`,
            changeDirection: keyMetrics.conversionSuccessRate.percentageChange >= 0 ? "up" : "down",
            vsLabel: "vs last period",
        },
        {
            id: "deposit-revenue",
            heading: "Deposit Revenue",
            value: `$${keyMetrics.depositRevenueCollected.current}`,
            changePercent: `${keyMetrics.depositRevenueCollected.percentageChange}%`,
            changeDirection: keyMetrics.depositRevenueCollected.percentageChange >= 0 ? "up" : "down",
            vsLabel: "vs last period",
        },
    ];

    return <MetricsRow metrics={metrics} />;
}