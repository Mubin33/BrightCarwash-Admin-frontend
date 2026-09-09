import type { DashboardMetricsResponse } from "@/types/dashboard";

export const mockDashboardData: DashboardMetricsResponse = {
  success: true,
  message: "Dashboard metrics retrieved successfully",
  data: {
    keyMetrics: {
      totalLeads: { current: 20, percentageChange: 100 },
      newThisWeek: { current: 14, percentageChange: 133.3 },
      conversionSuccessRate: { current: 0, percentageChange: 0 },
      depositRevenueCollected: { current: 40, percentageChange: 100 },
    },
    performanceTrend: [
      { month: "Jul", total: 0, converted: 0 },
      { month: "Aug", total: 0, converted: 0 },
      { month: "Sep", total: 0, converted: 0 },
      { month: "Oct", total: 0, converted: 0 },
      { month: "Nov", total: 0, converted: 0 },
      { month: "Dec", total: 0, converted: 0 },
      { month: "Jan", total: 0, converted: 0 },
      { month: "Feb", total: 0, converted: 0 },
      { month: "Mar", total: 0, converted: 0 },
      { month: "Apr", total: 0, converted: 0 },
      { month: "May", total: 0, converted: 0 },
      { month: "Jun", total: 20, converted: 0 },
    ],
    statusDistribution: [
      { stageName: "New Lead", count: 18, color: "#FF5733" },
      { stageName: "Old Lead", count: 2, color: "#FF5733" },
    ],
  },
};