import { createApi } from "@reduxjs/toolkit/query/react";
import type { DashboardMetricsResponse } from "@/types/dashboard";
import { APP_CONFIG } from "@/configs/app.config";
import { mockDashboardData } from "@/mocks/dashboard.mock";
import axiosInstance from "@/lib/axios-instance";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: async () => ({ data: null }),
  endpoints: (builder) => ({
    getDashboardMetrics: builder.query<DashboardMetricsResponse, void>({
      queryFn: async () => {
        try {
          if (APP_CONFIG.MOCK_MODE || APP_CONFIG.DASHBOARD_MOCK) {
            await delay(APP_CONFIG.MOCK_DELAY_MS);
            return { data: mockDashboardData };
          }
          const { data } = await axiosInstance.get<DashboardMetricsResponse>("/admin/lead/metrics");
          return { data };
        } catch (error) {
          return { error: { status: 500, data: error instanceof Error ? error.message : "Failed to fetch dashboard" } };
        }
      },
    }),
  }),
});

export const { useGetDashboardMetricsQuery } = dashboardApi;