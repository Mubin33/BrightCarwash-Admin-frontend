import { createApi } from "@reduxjs/toolkit/query/react";
import { fetchFromBackend } from "./faq.api";
import type { Section } from '@/types/section';

export const sectionApi = createApi({
  reducerPath: "sectionApi",
  baseQuery: async () => ({ data: null }),
  tagTypes: ["Sections"],
  endpoints: (builder) => ({
    createSection: builder.mutation({
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
                  : "Failed to create section",
            },
          };
        }
      },
      invalidatesTags: ["Sections"],
    }),

    getSections: builder.query<Section[], void>({
      queryFn: async () => {
        try {
          const json = await fetchFromBackend<any>(`/admin/sections`, {
            method: "GET",
          });
          return { data: json.data?.data || [] };
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
      providesTags: ["Sections"],
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
      providesTags: (_result, _error, key) => [{ type: 'Sections', id: key }],
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
      invalidatesTags: ["Sections"],
    }),

    // Reorder sections (bulk update sort_order)
    reorderSections: builder.mutation<{ success: boolean }, { sections: { section_key: string; sort_order: number }[] }>( {
      queryFn: async ({ sections }) => {
        try {
          const promises = sections.map((s) =>
            fetchFromBackend(`/admin/sections/${s.section_key}`, {
              method: 'PATCH',
              body: JSON.stringify({ sort_order: s.sort_order }),
            }),
          );
          await Promise.all(promises);
          return { data: { success: true } };
        } catch (error) {
          return {
            error: {
              status: 500,
              data: error instanceof Error ? error.message : 'Failed to reorder sections',
            },
          };
        }
      },
      invalidatesTags: ['Sections'],
    }),

     deleteSection: builder.mutation<{ success: boolean }, { key: string }>({
      queryFn: async (body) => {
        try {
          await fetchFromBackend<any>(
            `/admin/sections/${body.key}`,
            {
              method: "DELETE",
            },
          );
          return { data: { success: true } };
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
      invalidatesTags: ["Sections"],
    }),
  }),
});

export const {
  useCreateSectionMutation,
  useGetSectionsQuery,
  useGetSectionDetailsQuery,
  useUpdateSectionMutation,
  useReorderSectionsMutation,
  useDeleteSectionMutation,
} = sectionApi;
