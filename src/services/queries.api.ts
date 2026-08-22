import { createApi } from "@reduxjs/toolkit/query/react";
import axiosInstance from "@/lib/axios-instance";
import { quoteInterfece } from "@/types/queries";

export interface GetQuotesParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export const queriesApi = createApi({
  reducerPath: "queriesApi",
  baseQuery: async () => ({ data: null }),
  tagTypes: ["Queries"],

  endpoints: (builder) => ({
    getQuotes: builder.query<quoteInterfece, GetQuotesParams>({
      queryFn: async (params = { page: 1, limit: 10, status: "", search: "" }) => {
        try {
          const { data } = await axiosInstance.get<quoteInterfece>(
            `/admin/quotes?page=${params.page}&limit=${params.limit}&status=${params.status}&search=${params.search}`,
          );
          return { data };
        } catch (error: any) {
          return {
            error: {
              status: error?.response?.status || 500,
              data: error?.response?.data?.message || "Failed to fetch quotes",
            },
          };
        }
      },
      providesTags: ["Queries"],
      keepUnusedDataFor: 60,
    }),

    updateStatus: builder.mutation<any, { id: string; status: string }>({
      queryFn: async ({ id, status }: { id: string; status: string }) => {
        try {
          const { data } = await axiosInstance.patch<any>(`/admin/quotes/${id}`, { status });
          return { data };
        } catch (error: any) {
          return {
            error: {
              status: error?.response?.status || 500,
              data: error?.response?.data?.message || "Failed to update status",
            },
          };
        }
      },
      invalidatesTags: ["Queries"],
      async onQueryStarted({ id, status }, { dispatch, queryFulfilled }) {
        const patchQueriesDetail = dispatch(
          queriesApi.util.updateQueryData("queriesDetail", { id }, (draft: any) => {
            if (draft?.data) {
              draft.data.status = status;
            }
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patchQueriesDetail.undo();
        }
      },
    }),

    deleteQuote: builder.mutation<any, { id: string }>({
      queryFn: async ({ id }: { id: string }) => {
        try {
          const { data } = await axiosInstance.delete<any>(`/admin/quotes/${id}`);
          return { data };
        } catch (error: any) {
          return {
            error: {
              status: error?.response?.status || 500,
              data: error?.response?.data?.message || "Failed to delete quote",
            },
          };
        }
      },
      invalidatesTags: ["Queries"],
    }),

    queriesDetail: builder.query<any, { id: string }>({
      queryFn: async ({ id }: { id: string }) => {
        try {
          const { data } = await axiosInstance.get<quoteInterfece>(`/admin/quotes/${id}`);
          return { data };
        } catch (error: any) {
          return {
            error: {
              status: error?.response?.status || 500,
              data: error?.response?.data?.message || "Failed to fetch quote detail",
            },
          };
        }
      },
      providesTags: ["Queries"],
      keepUnusedDataFor: 60,
    }),

    sendEmail: builder.mutation<any, { id: string }>({
      queryFn: async ({ id }: { id: string }) => {
        try {
          const { data } = await axiosInstance.post<any>(`/admin/quotes/${id}/send-email`);
          return { data };
        } catch (error: any) {
          return {
            error: {
              status: error?.response?.status || 500,
              data: error?.response?.data?.message || "Failed to send email",
            },
          };
        }
      },
    }),
  }),
});

export const {
  useGetQuotesQuery,
  useUpdateStatusMutation,
  useDeleteQuoteMutation,
  useQueriesDetailQuery,
  useSendEmailMutation,
} = queriesApi;