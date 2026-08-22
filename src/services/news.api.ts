import { createApi } from '@reduxjs/toolkit/query/react';
import type { NewsItem, CreateNewsRequest, UpdateNewsRequest, NewsListResponse, NewsSingleResponse } from '@/types/news';
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

export const newsApi = createApi({
    reducerPath: 'newsApi',
    baseQuery: async () => ({ data: null }),
    tagTypes: ['News'],
    endpoints: (builder) => ({
        // Get all news - matches API response structure
        getNews: builder.query<NewsItem[], { search?: string; category_id?: string; is_published?: boolean; sort_by?: string; sort_order?: string; page?: number; limit?: number }>({
            queryFn: async (params = {}) => {
                try {
                    const queryParams = new URLSearchParams();
                    if (params.search) queryParams.append('search', params.search);
                    if (params.category_id) queryParams.append('category_id', params.category_id);
                    if (params.is_published !== undefined) queryParams.append('is_published', String(params.is_published));
                    if (params.sort_by) queryParams.append('sort_by', params.sort_by);
                    if (params.sort_order) queryParams.append('sort_order', params.sort_order);
                    if (params.page) queryParams.append('page', String(params.page || 1));
                    if (params.limit) queryParams.append('limit', String(params.limit || 50));

                    const url = `/admin/news-and-events${queryParams.toString() ? `?${queryParams}` : ''}`;
                    const json = await fetchFromBackend<NewsListResponse>(url);

                    return { data: json.data.items || [] };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data: error instanceof Error ? error.message : 'Failed to fetch news',
                        },
                    };
                }
            },
            providesTags: ['News'],
        }),

        // Get single news
        getNewsById: builder.query<NewsItem, string>({
            queryFn: async (id) => {
                try {
                    const json = await fetchFromBackend<NewsSingleResponse>(`/admin/news-and-events/${id}`);
                    return { data: json.data };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data: error instanceof Error ? error.message : 'Failed to fetch news item',
                        },
                    };
                }
            },
            providesTags: (_result, _error, id) => [{ type: 'News', id }],
        }),

        // Create news
        createNews: builder.mutation<NewsItem, CreateNewsRequest>({
            queryFn: async (body) => {
                try {
                    const formData = new FormData();
                    formData.append('title', body.title);
                    formData.append('content', body.content);
                    if (body.summary) formData.append('summary', body.summary);
                    formData.append('image', body.image);
                    formData.append('category_id', body.category_id);
                    if (body.is_published !== undefined) {
                        formData.append('is_published', String(body.is_published));
                    }

                    const token = getAccessToken();
                    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/admin/news-and-events`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}` },
                        body: formData,
                    });
                    if (!res.ok) throw new Error('Failed to create news');
                    const json = await res.json();
                    return { data: json.data };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data: error instanceof Error ? error.message : 'Failed to create news',
                        },
                    };
                }
            },
            invalidatesTags: ['News'],
        }),

        // Update news
        updateNews: builder.mutation<NewsItem, { id: string; data: UpdateNewsRequest }>({
            queryFn: async ({ id, data }) => {
                try {
                    const formData = new FormData();
                    if (data.title) formData.append('title', data.title);
                    if (data.content) formData.append('content', data.content);
                    if (data.summary) formData.append('summary', data.summary);
                    if (data.image) formData.append('image', data.image);
                    if (data.category_id) formData.append('category_id', data.category_id);
                    if (data.is_published !== undefined) {
                        formData.append('is_published', String(data.is_published));
                    }

                    const token = getAccessToken();
                    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/admin/news-and-events/${id}`, {
                        method: 'PATCH',
                        headers: { Authorization: `Bearer ${token}` },
                        body: formData,
                    });
                    if (!res.ok) throw new Error('Failed to update news');
                    const json = await res.json();
                    return { data: json.data };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data: error instanceof Error ? error.message : 'Failed to update news',
                        },
                    };
                }
            },
            invalidatesTags: (_result, _error, { id }) => ['News', { type: 'News', id }],
        }),

        // Delete news
        deleteNews: builder.mutation<{ success: boolean }, string>({
            queryFn: async (id) => {
                try {
                    await fetchFromBackend(`/admin/news-and-events/${id}`, { method: 'DELETE' });
                    return { data: { success: true } };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data: error instanceof Error ? error.message : 'Failed to delete news',
                        },
                    };
                }
            },
            invalidatesTags: ['News'],
        }),
    }),
});

export const {
    useGetNewsQuery,
    useGetNewsByIdQuery,
    useCreateNewsMutation,
    useUpdateNewsMutation,
    useDeleteNewsMutation,
} = newsApi;