import { createApi } from "@reduxjs/toolkit/query/react";
import { fetchFromBackend } from "./faq.api";

export interface WashWithPurposeFaq {
  id: string;
  question: string;
  ans: string;
  icon?: string;
  is_publish: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

interface ApiResponse<T> {
  data: T;
}

export const washWithPurposeApi = createApi({
  reducerPath: "washWithPurposeApi",
  baseQuery: async () => ({ data: null }),
  tagTypes: ["FaqwithPurpose"],
  endpoints: (builder) => ({
    createFaq: builder.mutation<WashWithPurposeFaq, FormData>({
      queryFn: async (formData: FormData) => {
        try {
          const json = await fetchFromBackend<ApiResponse<WashWithPurposeFaq>>(
            `/admin/wash-with-purpose-faqs`,
            {
              method: "POST",
              body: formData,
            },
          );
          return { data: json.data };
        } catch (error) {
          return {
            error: {
              status: 500,
              data:
                error instanceof Error ? error.message : "Failed to create FAQ",
            },
          };
        }
      },
      invalidatesTags: ["FaqwithPurpose"],
    }),

    getFaqs: builder.query<WashWithPurposeFaq[], void>({
      queryFn: async () => {
        try {
          const json = await fetchFromBackend<ApiResponse<WashWithPurposeFaq[]>>(
            `/admin/wash-with-purpose-faqs`,
            {
              method: "GET",
            },
          );
          return { data: json.data || [] };
        } catch (error) {
          return {
            error: {
              status: 500,
              data:
                error instanceof Error ? error.message : "Failed to get FAQs",
            },
          };
        }
      },
      providesTags: ["FaqwithPurpose"],
    }),

    getFaqDetails: builder.query<WashWithPurposeFaq, string>({
      queryFn: async (id: string) => {
        try {
          const json = await fetchFromBackend<ApiResponse<WashWithPurposeFaq>>(
            `/admin/wash-with-purpose-faqs/${id}`,
            {
              method: "GET",
            },
          );
          return { data: json.data };
        } catch (error) {
          return {
            error: {
              status: 500,
              data:
                error instanceof Error
                  ? error.message
                  : "Failed to get FAQ details",
            },
          };
        }
      },
      providesTags: (_result, _error, id) => [
        { type: "FaqwithPurpose", id: id },
      ],
    }),

    updateFaq: builder.mutation<
      WashWithPurposeFaq,
      { id: string; formData: FormData }
    >({
      queryFn: async ({ id, formData }: { id: string; formData: FormData }) => {
        try {
          const json = await fetchFromBackend<ApiResponse<WashWithPurposeFaq>>(
            `/admin/wash-with-purpose-faqs/${id}`,
            {
              method: "PATCH",
              body: formData,
            },
          );
          return { data: json.data };
        } catch (error) {
          return {
            error: {
              status: 500,
              data:
                error instanceof Error ? error.message : "Failed to update FAQ",
            },
          };
        }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "FaqwithPurpose", id },
        "FaqwithPurpose",
      ],
    }),
    reorderFaq: builder.mutation<
      { success: boolean },
      { id: string; display_order: number }[]
    >({
      queryFn: async (reorderData) => {
        try {
          const promises = reorderData.map(({ id, display_order }) => {
            const formData = new FormData();
            formData.append("display_order", String(display_order));

            return fetchFromBackend(`/admin/wash-with-purpose-faqs/${id}`, {
              method: "PATCH",
              body: formData,
            });
          });

          await Promise.all(promises);
          return { data: { success: true } };
        } catch (error) {
          return {
            error: {
              status: 500,
              data:
                error instanceof Error
                  ? error.message
                  : "Failed to reorder FAQs",
            },
          };
        }
      },
      invalidatesTags: ["FaqwithPurpose"],
    }),

    deleteFaq: builder.mutation<{ success: boolean }, string>({
      queryFn: async (id: string) => {
        try {
          await fetchFromBackend<ApiResponse<null>>(`/admin/wash-with-purpose-faqs/${id}`, {
            method: "DELETE",
          });
          return { data: { success: true } };
        } catch (error) {
          return {
            error: {
              status: 500,
              data:
                error instanceof Error ? error.message : "Failed to delete FAQ",
            },
          };
        }
      },
      invalidatesTags: ["FaqwithPurpose"],
    }),
  }),
});

export const {
  useCreateFaqMutation,
  useGetFaqsQuery,
  useGetFaqDetailsQuery,
  useUpdateFaqMutation,
  useReorderFaqMutation,
  useDeleteFaqMutation,
} = washWithPurposeApi;
