import axiosInstance from "@/lib/axios-instance";
import { quoteInterfece, QuoteDetailResponse } from "@/types/queries";
import { createApi } from "@reduxjs/toolkit/query/react";

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
      queryFn: async (
        params = {
          page: 1,
          limit: 10,
          status: "",
          search: "",
        },
      ) => {
        try {
          const search = (params.search ?? "").replace(/^\+/, "");

          const queryParams: Record<string, string | number> = {
            page: params.page ?? 1,
            limit: params.limit ?? 10,
          };
          if (params.status) {
            queryParams.status = params.status;
          }
          if (search) {
            queryParams.search = search;
          }

          const { data } = await axiosInstance.get<quoteInterfece>(
            "/admin/quotes",
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
              data: error?.response?.data?.message || "Failed to fetch quotes",
            },
          };
        }
      },

      providesTags: ["Queries"],
      keepUnusedDataFor: 60,
    }),

    updateStatus: builder.mutation<{ success: boolean; message?: string }, { id: string; status: string }>({
      queryFn: async ({ id, status }: { id: string; status: string }) => {
        try {
          const { data } = await axiosInstance.patch<{ success: boolean; message?: string }>(
            `/admin/quotes/${id}`,
            { status },
          );
          return { data };
        } catch (err) {
          const error = err as { response?: { data?: { message?: string }; status?: number } };
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
          queriesApi.util.updateQueryData(
            "queriesDetail",
            { id },
            (draft) => {
              if (draft?.data) {
                draft.data.status = status;
              }
            },
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          patchQueriesDetail.undo();
        }
      },
    }),

    deleteQuote: builder.mutation<{ success: boolean; message?: string }, { id: string }>({
      queryFn: async ({ id }: { id: string }) => {
        try {
          const { data } = await axiosInstance.delete<{ success: boolean; message?: string }>(
            `/admin/quotes/${id}`,
          );
          return { data };
        } catch (err) {
          const error = err as { response?: { data?: { message?: string }; status?: number } };
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

    queriesDetail: builder.query<QuoteDetailResponse, { id: string }>({
      queryFn: async ({ id }: { id: string }) => {
        try {
          const { data } = await axiosInstance.get<QuoteDetailResponse>(`/admin/quotes/${id}`);
          return { data };
        } catch (err) {
          const error = err as { response?: { data?: { message?: string }; status?: number } };
          return {
            error: {
              status: error?.response?.status || 500,
              data:
                error?.response?.data?.message ||
                "Failed to fetch quote detail",
            },
          };
        }
      },
      providesTags: ["Queries"],
      keepUnusedDataFor: 60,
    }),

  }),
});

export const {
  useGetQuotesQuery,
  useUpdateStatusMutation,
  useDeleteQuoteMutation,
  useQueriesDetailQuery,
} = queriesApi;
