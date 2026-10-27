import { createApi } from "@reduxjs/toolkit/query/react";
import type { ActivityLogsResponse } from "@/types/activity-log";
import axiosInstance from "@/lib/axios-instance";

export interface GetActivityLogsParams {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  timeRange?: string;
}

export const activityLogApi = createApi({
  reducerPath: "activityLogApi",
  baseQuery: async () => ({ data: null }),
  tagTypes: ["ActivityLogs"],
  endpoints: (builder) => ({
    getActivityLogs: builder.query<ActivityLogsResponse, GetActivityLogsParams>(
      {
        queryFn: async (params = { page: 1, limit: 10 }) => {
          try {
            const queryParams: Record<string, string | number> = {
              page: params.page ?? 1,
              limit: params.limit ?? 10,
            };
            if (params.search && params.search.trim()) {
              queryParams.search = params.search.trim();
            }
            if (params.action && params.action !== "All types") {
              queryParams.action = params.action.trim();
            }
            if (params.timeRange && params.timeRange !== "All Time") {
              queryParams.timeRange = params.timeRange.trim();
            }

            const { data } = await axiosInstance.get<ActivityLogsResponse>(
              "/admin/activity-log",
              {
                params: queryParams,
              },
            );
            return { data };
          } catch (err) {
            const error = err as { response?: { data?: { message?: string }; status?: number } };
            return {
              error: {
                status: error?.response?.status || 500,
                data:
                  error?.response?.data?.message ||
                  "Failed to fetch activity logs",
              },
            };
          }
        },
        providesTags: ["ActivityLogs"],
        keepUnusedDataFor: 60,
      },
    ),
  }),
});

export const { useGetActivityLogsQuery } = activityLogApi;
