import { InquiriesChart } from "@/components/pages/dashboard/InquiriesChart";
import { ServiceMixChart } from "@/components/pages/dashboard/ServiceMixChart";
import type { DashboardMetricsResponse } from "@/types/dashboard";

interface DashboardChartsProps {
    data: DashboardMetricsResponse["data"];
}

export function DashboardCharts({ data }: DashboardChartsProps) {
    const { performanceTrend, statusDistribution } = data;

    const chartData = performanceTrend.map((d) => ({
        month: d.month,
        total: d.total,
        converted: d.converted,
    }));

    const totalDistribution = statusDistribution.reduce((sum, s) => sum + s.count, 0);
    const serviceMix = statusDistribution.map((s) => ({
        name: s.stageName,
        percentage: totalDistribution > 0 ? Math.round((s.count / totalDistribution) * 100) : 0,
    }));

    return (
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 w-full items-stretch" style={{ minHeight: "350px" }}>
            <div className="w-full sm:w-full lg:w-3/4 xl:w-3/4">
                <InquiriesChart data={chartData} />
            </div>
            <div className="w-full lg:w-2/4 xl:w-1/4">
                <ServiceMixChart data={serviceMix} />
            </div>
        </div>
    );
}