import { createApi } from "@reduxjs/toolkit/query/react";
import { fetchFromBackend } from "./faq.api";

export const SectionApi = createApi({
  reducerPath: "sectionApi",
  baseQuery: async () => ({ data: null }),
  tagTypes: ["FAQs"],
  endpoints: (builder) => ({
    createSection: builder.mutation({
      queryFn: async (body) => {
        try {
          const json = await fetchFromBackend<any>("/admin/section", {
            method: "POST",
            body: JSON.stringify(body),
          });
          return { data: json.data };
        } catch (error) {
          return {
            error: {
              status: 500,
              data:
                error instanceof Error
                  ? error.message
                  : "Failed to create section",
            },
          };
        }
      },
      invalidatesTags: ["FAQs"],
    }),

    getSections: builder.query({
      queryFn: async () => {
        try {
          const json = await fetchFromBackend<any>(`/admin/sections`, {
            method: "GET",
          });
          return { data: json.data };
        } catch (error) {
          return {
            error: {
              status: 500,
              data:
                error instanceof Error
                  ? error.message
                  : "Failed to get sections",
            },
          };
        }
      },
      providesTags: ["FAQs"],
    }),

    getSectionDetails: builder.query({
      queryFn: async (key) => {
        try {
          const json = await fetchFromBackend<any>(`/admin/sections/${key}`, {
            method: "GET",
          });
          return { data: json.data };
        } catch (error) {
          return {
            error: {
              status: 500,
              data:
                error instanceof Error
                  ? error.message
                  : "Failed to get section details",
            },
          };
        }
      },
    }),

    updateSection: builder.mutation({
      queryFn: async (body) => {
        try {
          const json = await fetchFromBackend<any>(
            `/admin/sections/${body.key}`,
            {
              method: "PATCH",
              body: JSON.stringify(body),
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
                  : "Failed to update section",
            },
          };
        }
      },
      invalidatesTags: ["FAQs"],
    }),

    deleteSection: builder.mutation({
      queryFn: async (body) => {
        try {
          const json = await fetchFromBackend<any>(
            `/admin/sections/${body.key}`,
            {
              method: "DELETE",
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
                  : "Failed to delete section",
            },
          };
        }
      },
      invalidatesTags: ["FAQs"],
    }),
  }),
});

export const {
  useCreateSectionMutation,
  useGetSectionsQuery,
  useGetSectionDetailsQuery,
  useUpdateSectionMutation,
  useDeleteSectionMutation,
} = SectionApi;
