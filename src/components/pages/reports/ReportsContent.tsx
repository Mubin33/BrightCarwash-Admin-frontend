"use client";

import { FilterDropdown } from "@/components/ui/FilterDropdown";
import { usePermission } from "@/hooks/usePermission";
import { useReportState } from "@/hooks/useReportState";
import { PERMISSIONS } from "@/lib/permissions";
import { format, subDays, subMonths } from "date-fns";
import { useEffect, useMemo } from "react";
import { CampaignPerformanceContent } from "./campaign-performance/CampaignPerformanceContent";
import { LeadConversionContent } from "./lead-conversion/LeadConversionContent";
import { ReportTabSwitcher } from "./lead-conversion/ReportTabSwitcher";
import { MemberActivityContent } from "./member-activity/MemberActivityContent";

const PERIOD_OPTIONS = [
  { value: "last30days", label: "Last 30 Days" },
  { value: "last6months", label: "Last 6 Months" },
  { value: "thisYear", label: "This Year" },
];

export function ReportsContent() {
  const { tab, period, setTab, setPeriod } = useReportState();

  const canStage = usePermission(PERMISSIONS.report.stage);
  const canCampaign = usePermission(PERMISSIONS.report.campaign);
  const canMember = usePermission(PERMISSIONS.report.member);

  const availableTabs = useMemo(() => {
    const list = [];
    if (canStage)
      list.push({ value: "lead-conversion", label: "Lead Conversion" });
    if (canCampaign)
      list.push({
        value: "campaign-performance",
        label: "Campaign Performance",
      });
    if (canMember)
      list.push({ value: "member-activity", label: "Member Activity" });
    return list;
  }, [canStage, canCampaign, canMember]);

  const currentTab = useMemo(() => {
    if (availableTabs.length === 0) return "";
    if (availableTabs.some((t) => t.value === tab)) return tab;
    return availableTabs[0].value;
  }, [availableTabs, tab]);

  useEffect(() => {
    if (
      availableTabs.length > 0 &&
      !availableTabs.some((t) => t.value === tab)
    ) {
      setTab(availableTabs[0].value, true);
    }
  }, [availableTabs, tab, setTab]);

  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    if (period === "last30days") {
      return {
        startDate: format(subDays(now, 30), "yyyy-MM-dd'T'00:00:00'Z'"),
        endDate: format(now, "yyyy-MM-dd'T'23:59:59'Z'"),
      };
    }
    if (period === "last6months") {
      return {
        startDate: format(subMonths(now, 6), "yyyy-MM-dd'T'00:00:00'Z'"),
        endDate: format(now, "yyyy-MM-dd'T'23:59:59'Z'"),
      };
    }
    return {
      startDate: format(
        new Date(now.getFullYear(), 0, 1),
        "yyyy-MM-dd'T'00:00:00'Z'",
      ),
      endDate: format(now, "yyyy-MM-dd'T'23:59:59'Z'"),
    };
  }, [period]);

  return (
    <div className="flex flex-col gap-6 w-full p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-[#0B1220] font-lora text-xl font-bold">
          Reports & Analytics
        </h2>
        <FilterDropdown
          label="Period"
          options={PERIOD_OPTIONS}
          value={period}
          onChange={setPeriod}
        />
      </div>
      <ReportTabSwitcher
        tabs={availableTabs}
        activeTab={currentTab}
        onChange={setTab}
      />
      {currentTab === "lead-conversion" && canStage && (
        <LeadConversionContent startDate={startDate} endDate={endDate} />
      )}
      {currentTab === "campaign-performance" && canCampaign && (
        <CampaignPerformanceContent startDate={startDate} endDate={endDate} />
      )}
      {currentTab === "member-activity" && canMember && (
        <MemberActivityContent startDate={startDate} endDate={endDate} />
      )}
    </div>
  );
}
