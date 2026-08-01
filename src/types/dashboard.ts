export interface MetricCard {
  id: string;
  heading: string;
  value: string;
  changePercent: string;
  changeDirection?: "up" | "down" | "none";
  vsLabel: string;
}

export interface ChartDataPoint {
  month: string;
  total: number;
  converted: number;
}

export interface ServiceMixItem {
  name: string;
  percentage: number;
}

export interface RecentInquiry {
  id: string;
  name: string;
  avatar: string;
  service: string;
  email: string;
  vehicle?: string;
  source: string;
  deposit: string;
  stage: string;
  date: string;
}

export interface DashboardMetricsResponse {
  success: boolean;
  message: string;
  data: {
    keyMetrics: {
      totalLeads: { current: number; percentageChange: number };
      newThisWeek: { current: number; percentageChange: number };
      conversionSuccessRate: { current: number; percentageChange: number };
      depositRevenueCollected: { current: number; percentageChange: number };
    };
    performanceTrend: { month: string; total: number; converted: number }[];
    statusDistribution: { stageName: string; count: number; color: string }[];
  };
}