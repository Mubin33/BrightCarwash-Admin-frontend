import { createApi } from "@reduxjs/toolkit/query/react";
import type { ActivityLogsResponse } from "@/types/activity-log";
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
              "/admin/activity-log",
              {
                params: {
                  page: params.page,
                  limit: params.limit,
                },
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
