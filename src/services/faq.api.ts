import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  FAQ,
  CreateFAQRequest,
  UpdateFAQRequest,
  FAQListResponse,
  FAQSingleResponse,
} from "@/types/faq";
import { getAccessToken } from "@/lib/auth-client";
import { APP_CONFIG } from "@/configs/app.config";

export async function fetchFromBackend<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(options?.headers);

  headers.set("Authorization", `Bearer ${token}`);

  // The browser must set the multipart boundary when sending FormData.
  // Explicitly setting application/json makes file uploads unreadable by the API.
  if (!(options?.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${APP_CONFIG.API_BASE_URL}${url}`, {
    ...options,
    headers,
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);

  const text = await res.text();
  if (!text) {
    return null as unknown as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Failed to parse JSON response");
  }
}

export const faqApi = createApi({
  reducerPath: "faqApi",
  baseQuery: async () => ({ data: null }),
  tagTypes: ["FAQs"],
  endpoints: (builder) => ({
    // Get all FAQs
    getFAQs: builder.query<
      FAQ[],
      {
        search?: string;
        is_active?: boolean;
        sort_by?: string;
        sort_order?: string;
        page?: number;
        limit?: number;
      }
    >({
      queryFn: async (params = {}) => {
        try {
          const queryParams = new URLSearchParams();
          if (params.search) queryParams.append("search", params.search);
          if (params.is_active !== undefined)
            queryParams.append("is_active", String(params.is_active));
          if (params.sort_by) queryParams.append("sort_by", params.sort_by);
          if (params.sort_order)
            queryParams.append("sort_order", params.sort_order);
          if (params.page) queryParams.append("page", String(params.page));
          if (params.limit)
            queryParams.append("limit", String(params.limit || 50));

          const url = `/admin/faq${queryParams.toString() ? `?${queryParams}` : ""}`;
          const json = await fetchFromBackend<FAQListResponse>(url);
          return { data: json.data.faqs || [] };
        } catch (error) {
          return {
            error: {
              status: 500,
              data:
                error instanceof Error ? error.message : "Failed to fetch FAQs",
            },
          };
        }
      },
      providesTags: ["FAQs"],
    }),

    // Get single FAQ
    getFAQById: builder.query<FAQ, string>({
      queryFn: async (id) => {
        try {
          const json = await fetchFromBackend<FAQSingleResponse>(
            `/admin/faq/${id}`,
          );
          return { data: json.data };
        } catch (error) {
          return {
            error: {
              status: 500,
              data:
                error instanceof Error ? error.message : "Failed to fetch FAQ",
            },
          };
        }
      },
      providesTags: (_result, _error, id) => [{ type: "FAQs", id }],
    }),

    // Create FAQ
    createFAQ: builder.mutation<FAQ, CreateFAQRequest>({
      queryFn: async (body) => {
        try {
          const json = await fetchFromBackend<FAQSingleResponse>("/admin/faq", {
            method: "POST",
            body: JSON.stringify(body),
          });
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
      invalidatesTags: ["FAQs"],
    }),

    // Update FAQ
    updateFAQ: builder.mutation<FAQ, { id: string; data: UpdateFAQRequest }>({
      queryFn: async ({ id, data }) => {
        try {
          const json = await fetchFromBackend<FAQSingleResponse>(
            `/admin/faq/${id}`,
            {
              method: "PATCH",
              body: JSON.stringify(data),
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
        "FAQs",
        { type: "FAQs", id },
      ],
    }),

    // Delete FAQ
    deleteFAQ: builder.mutation<{ success: boolean }, string>({
      queryFn: async (id) => {
        try {
          await fetchFromBackend(`/admin/faq/${id}`, { method: "DELETE" });
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
      invalidatesTags: ["FAQs"],
    }),

    // Reorder FAQs (bulk update display_order)
    reorderFAQs: builder.mutation<
      { success: boolean },
      { faqs: { id: string; display_order: number }[] }
    >({
      queryFn: async ({ faqs }) => {
        try {
          // Update each FAQ's display_order
          const promises = faqs.map((faq) =>
            fetchFromBackend(`/admin/faq/${faq.id}`, {
              method: "PATCH",
              body: JSON.stringify({ display_order: faq.display_order }),
            }),
          );
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
      invalidatesTags: ["FAQs"],
    }),
  }),
});

export const {
  useGetFAQsQuery,
  useGetFAQByIdQuery,
  useCreateFAQMutation,
  useUpdateFAQMutation,
  useDeleteFAQMutation,
  useReorderFAQsMutation,
} = faqApi;
