import { createApi } from "@reduxjs/toolkit/query/react";
import type { ActivityLog, ActivityLogsResponse } from "@/types/activity-log";
import { APP_CONFIG } from "@/configs/app.config";
import axiosInstance from "@/lib/axios-instance";

interface GetActivityLogsParams {
  page?: number;
  limit?: number;
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
            const { data } = await axiosInstance.get<ActivityLogsResponse>(
              `/admin/activity-log?page=${params.page}&limit=${params.limit}`,
            );
            return { data };
          } catch (error: any) {
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
