import { createApi } from "@reduxjs/toolkit/query/react";

import { getAccessToken } from "@/lib/auth-client";
import { APP_CONFIG } from "@/configs/app.config";

export async function fetchFromBackend<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const token = getAccessToken();

  const headers = new Headers(options?.headers);

  headers.set("Authorization", `Bearer ${token}`);

  if (!(options?.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${APP_CONFIG.API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }

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

export interface BusinessHoursContent {
  sunday: {
    start_time: string;
    end_time: string;
  };

  mondayThursday: {
    start_time: string;
    end_time: string;
  };

  fridaySaturday: {
    start_time: string;
    end_time: string;
  };
}

export interface BusinessHoursResponse {
  section_key: string;
  section_type: string;
  content: BusinessHoursContent;
  is_active: boolean;
  sort_order: number;
}

export interface ApiResponse<T> {
  data: T;
}

interface EditBusinessHoursRequest {
  section_name: string;

  body: {
    section_key: string;
    section_type: string;
    content: BusinessHoursContent;
    is_active: boolean;
    sort_order: number;
  };
}

export const businessHoursApi = createApi({
  reducerPath: "businessHoursApi",

  baseQuery: async () => ({
    data: null,
  }),

  tagTypes: ["Business_Hours"],

  endpoints: (builder) => ({
    // GET Business Hours
    getBusinessHours: builder.query<
      BusinessHoursResponse,
      { section_name: string }
    >({
      queryFn: async ({ section_name }) => {
        try {
          const json = await fetchFromBackend<
            ApiResponse<BusinessHoursResponse>
          >(`/admin/sections/${section_name}`, {
            method: "GET",
          });

          return {
            data: json.data,
          };
        } catch (error) {
          return {
            error: {
              status: 500,
              data:
                error instanceof Error
                  ? error.message
                  : "Failed to get Business Hours",
            },
          };
        }
      },

      providesTags: ["Business_Hours"],
    }),

    // PATCH Business Hours
    editBusinessHours: builder.mutation<
      ApiResponse<BusinessHoursResponse>,
      EditBusinessHoursRequest
    >({
      queryFn: async ({ section_name, body }) => {
        try {
          const json = await fetchFromBackend<BusinessHoursResponse>(
            `/admin/sections/${section_name}`,
            {
              method: "PATCH",
              body: JSON.stringify(body),
            },
          );

          return {
            data: {
              data: json,
            },
          };
        } catch (error) {
          return {
            error: {
              status: 500,
              data:
                error instanceof Error
                  ? error.message
                  : "Failed to update Business Hours",
            },
          };
        }
      },

      invalidatesTags: ["Business_Hours"],
    }),
  }),
});

export const { useGetBusinessHoursQuery, useEditBusinessHoursMutation } =
  businessHoursApi;
