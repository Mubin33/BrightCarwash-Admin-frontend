"use client";

import { useEffect, useState } from "react";
import { DashboardMetrics } from "@/components/pages/dashboard/DashboardMetrics";
import { DashboardCharts } from "@/components/pages/dashboard/DashboardCharts";
import { RecentInquiriesTable } from "@/components/pages/dashboard/RecentInquiriesTable";
import { useGetDashboardMetricsQuery } from "@/services/dashboard.api";
import { useGetLeadsQuery } from "@/services/leads.api";
import { getStages } from "@/services/stage.service";
import type { StageOption } from "@/components/ui/StageDropdown";
import { mapStagesToOptions } from "@/lib/stage-utils";

export function DashboardContent() {
  const { data: metricsData, isLoading: metricsLoading, error: metricsError } = useGetDashboardMetricsQuery();

  const { data: leadsResponse, isLoading: leadsLoading, refetch: refetchLeads } = useGetLeadsQuery({
    page: 1,
    limit: 10,
  });

  const [stages, setStages] = useState<StageOption[]>([]);
  const [stagesLoading, setStagesLoading] = useState(true);

  useEffect(() => {
    refetchLeads();
  }, [refetchLeads]);

  useEffect(() => {
    getStages().then((s) => {
      const mappedStages = mapStagesToOptions(s);
      setStages(mappedStages);
      setStagesLoading(false);
    });
  }, []);

  const isLoading = metricsLoading || leadsLoading || stagesLoading;

  if (isLoading) {
    return (
      <div className="w-full max-w-full flex flex-col gap-4 animate-pulse">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div className="h-6 w-32 bg-slate-200 rounded-md" />
          <div className="h-9 w-28 bg-slate-200 rounded-md" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-[140px] bg-slate-200 rounded-xl"
            />
          ))}
        </div>

        {/* Chart + Side Panel */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="w-full lg:w-3/4 h-[350px] bg-slate-200 rounded-xl" />
          <div className="w-full lg:w-1/4 h-[350px] bg-slate-200 rounded-xl" />
        </div>

        {/* Bottom Chart */}
        <div className="h-[300px] bg-slate-200 rounded-xl" />
      </div>
    );
  }

  if (metricsError || !metricsData?.data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-14 h-14 rounded-full bg-[#FFE6E6] flex items-center justify-center mb-4">
          <span className="text-[#FF4345] text-2xl font-bold">!</span>
        </div>
        <h3 className="text-[#1B1B1B] font-inter text-lg font-semibold mb-1">Failed to load</h3>
        <p className="text-[#777980] font-inter text-sm">Please refresh the page or try again later.</p>
      </div>
    );
  }

  const leadsData = leadsResponse?.data || [];

  const recentLeads = leadsData.slice(0, 4).map((lead) => ({
    id: lead.id,
    name: lead.name,
    avatar: lead.avatar,
    service: lead.service,
    email: lead.email,
    source: lead.source,
    deposit: lead.depositStatus.toLowerCase() || "none",
    stage: lead.stage,
    date: lead.date,
  }));

  return (
    <div className="w-full max-w-full flex flex-col gap-3 sm:gap-4">
      <div className="flex justify-between items-end gap-3">
        <h2 className="text-[#0B1220] font-lora text-lg sm:text-xl font-bold leading-[100%]">Key Metrics</h2>
      </div>

      <DashboardMetrics data={metricsData.data} />
      <DashboardCharts data={metricsData.data} />
      <RecentInquiriesTable data={recentLeads} stages={stages} />
    </div>
  );
}