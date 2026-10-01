import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  HeroSection,
  UpdateHeroSectionRequest,
  SectionSingleResponse,
} from "@/types/hero";
import { fetchFromBackend, apiFetch } from "@/lib/api-fetch";

export async function uploadHeroImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("files", file);

  const response = await apiFetch("/admin/files/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to upload image");
  }

  const responseData = await response.json();
  const uploadedFile =
    responseData.data?.[0] || responseData.data || responseData;

  const imagePath =
    uploadedFile.path ||
    uploadedFile.fileUrl ||
    uploadedFile.url ||
    uploadedFile.location;

  if (!imagePath) {
    throw new Error("No image URL returned from upload");
  }

  return imagePath;
}

export const heroApi = createApi({
  reducerPath: "heroApi",
  baseQuery: async () => ({ data: null }),
  tagTypes: ["Hero"],
  endpoints: (builder) => ({
    getHeroSection: builder.query<HeroSection, void>({
      queryFn: async () => {
        try {
          const json = await fetchFromBackend<SectionSingleResponse>(
            "/admin/sections/home_hero",
          );
          return { data: json.data };
        } catch (error) {
          return {
            error: {
              status: 500,
              data:
                error instanceof Error
                  ? error.message
                  : "Failed to fetch hero section",
            },
          };
        }
      },
      providesTags: ["Hero"],
    }),

    updateHeroSection: builder.mutation<
      HeroSection,
      { key: string; data: UpdateHeroSectionRequest }
    >({
      queryFn: async ({ key, data }) => {
        try {
          const payload = {
            section_type: "hero",
            ...data,
          };

          const json = await fetchFromBackend<SectionSingleResponse>(
            `/admin/sections/${key}`,
            {
              method: "PATCH",
              body: JSON.stringify(payload),
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
                  : "Failed to update hero section",
            },
          };
        }
      },
      invalidatesTags: ["Hero"],
    }),
  }),
});

export const { useGetHeroSectionQuery, useUpdateHeroSectionMutation } = heroApi;
