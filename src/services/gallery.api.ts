import { createApi } from '@reduxjs/toolkit/query/react';
import type { GalleryItem, CreateGalleryRequest, UpdateGalleryRequest, GalleryListResponse, GallerySingleResponse } from '@/types/gallery';
import { getAccessToken } from '@/lib/auth-client';
import { APP_CONFIG } from '@/configs/app.config';

async function fetchFromBackend<T>(url: string, options?: RequestInit): Promise<T> {
    const token = getAccessToken();
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}${url}`, {
        ...options,
        headers: {
            Authorization: `Bearer ${token}`,
            ...options?.headers,
        },
    });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res.json();
}

export interface GalleryQueryResult {
    items: GalleryItem[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
}

export const galleryApi = createApi({
    reducerPath: 'galleryApi',
    baseQuery: async () => ({ data: null }),
    tagTypes: ['Gallery'],
    endpoints: (builder) => ({
        getGallery: builder.query<GalleryQueryResult, { search?: string; is_published?: boolean; sort_by?: string; sort_order?: string; page?: number; limit?: number }>({
            queryFn: async (params = {}) => {
                try {
                    const queryParams = new URLSearchParams();
                    if (params.search) queryParams.append('search', params.search);
                    if (params.is_published !== undefined) queryParams.append('is_published', String(params.is_published));
                    if (params.sort_by) queryParams.append('sort_by', params.sort_by);
                    if (params.sort_order) queryParams.append('sort_order', params.sort_order);
                    if (params.page) queryParams.append('page', String(params.page));
                    if (params.limit) queryParams.append('limit', String(params.limit || 50));

                    const url = `/admin/gallery${queryParams.toString() ? `?${queryParams}` : ''}`;
                    const json = await fetchFromBackend<GalleryListResponse>(url);
                    return {
                        data: {
                            items: json.data.galleries || [],
                            totalItems: json.data.meta?.total_items || 0,
                            totalPages: json.data.meta?.total_pages || 1,
                            currentPage: json.data.meta?.current_page || 1,
                        },
                    };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data: error instanceof Error ? error.message : 'Failed to fetch gallery',
                        },
                    };
                }
            },
            providesTags: ['Gallery'],
        }),

        getGalleryById: builder.query<GalleryItem, string>({
            queryFn: async (id) => {
                try {
                    const json = await fetchFromBackend<GallerySingleResponse>(`/admin/gallery/${id}`);
                    return { data: json.data };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data: error instanceof Error ? error.message : 'Failed to fetch gallery item',
                        },
                    };
                }
            },
            providesTags: (_result, _error, id) => [{ type: 'Gallery', id }],
        }),

        createGallery: builder.mutation<GalleryItem, CreateGalleryRequest>({
            queryFn: async (body) => {
                try {
                    const formData = new FormData();
                    formData.append('name', body.name);
                    formData.append('file', body.file);
                    if (body.is_published !== undefined) {
                        formData.append('is_published', String(body.is_published));
                    }

                    const token = getAccessToken();
                    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/admin/gallery`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}` },
                        body: formData,
                    });
                    if (!res.ok) throw new Error('Failed to create gallery item');
                    const json = await res.json();
                    return { data: json.data };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data: error instanceof Error ? error.message : 'Failed to create gallery item',
                        },
                    };
                }
            },
            invalidatesTags: ['Gallery'],
        }),

        updateGallery: builder.mutation<GalleryItem, { id: string; data: UpdateGalleryRequest }>({
            queryFn: async ({ id, data }) => {
                try {
                    const formData = new FormData();
                    if (data.name) formData.append('name', data.name);
                    if (data.file) formData.append('file', data.file);
                    if (data.is_published !== undefined) {
                        formData.append('is_published', String(data.is_published));
                    }

                    const token = getAccessToken();
                    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/admin/gallery/${id}`, {
                        method: 'PATCH',
                        headers: { Authorization: `Bearer ${token}` },
                        body: formData,
                    });
                    if (!res.ok) throw new Error('Failed to update gallery item');
                    const json = await res.json();
                    return { data: json.data };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data: error instanceof Error ? error.message : 'Failed to update gallery item',
                        },
                    };
                }
            },
            invalidatesTags: (_result, _error, { id }) => ['Gallery', { type: 'Gallery', id }],
        }),

        deleteGallery: builder.mutation<{ success: boolean }, string>({
            queryFn: async (id) => {
                try {
                    await fetchFromBackend(`/admin/gallery/${id}`, { method: 'DELETE' });
                    return { data: { success: true } };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data: error instanceof Error ? error.message : 'Failed to delete gallery item',
                        },
                    };
                }
            },
            invalidatesTags: ['Gallery'],
        }),
    }),
});

export const {
    useGetGalleryQuery,
    useGetGalleryByIdQuery,
    useCreateGalleryMutation,
    useUpdateGalleryMutation,
    useDeleteGalleryMutation,
} = galleryApi;