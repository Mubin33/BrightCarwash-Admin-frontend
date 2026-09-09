import { createApi } from '@reduxjs/toolkit/query/react';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest, CategoryListResponse } from '@/types/news';
import { getAccessToken } from '@/lib/auth-client';
import { APP_CONFIG } from '@/configs/app.config';

async function fetchFromBackend<T>(url: string, options?: RequestInit): Promise<T> {
    const token = getAccessToken();
    const res = await fetch(`${APP_CONFIG.API_BASE_URL}${url}`, {
        ...options,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res.json();
}

export const categoryApi = createApi({
    reducerPath: 'categoryApi',
    baseQuery: async () => ({ data: null }),
    tagTypes: ['Categories'],
    endpoints: (builder) => ({
        // Get all categories
        getCategories: builder.query<Category[], void>({
            queryFn: async () => {
                try {
                    const json = await fetchFromBackend<CategoryListResponse>('/admin/news-and-events/categories');
                    return { data: json.data || [] };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data: error instanceof Error ? error.message : 'Failed to fetch categories',
                        },
                    };
                }
            },
            providesTags: ['Categories'],
        }),

        // Create category
        createCategory: builder.mutation<Category, CreateCategoryRequest>({
            queryFn: async (body) => {
                try {
                    const json = await fetchFromBackend<{ success: boolean; message: string; data: Category }>(
                        '/admin/news-and-events/categories',
                        {
                            method: 'POST',
                            body: JSON.stringify(body),
                        }
                    );
                    return { data: json.data };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data: error instanceof Error ? error.message : 'Failed to create category',
                        },
                    };
                }
            },
            invalidatesTags: ['Categories'],
        }),

        // Update category
        updateCategory: builder.mutation<Category, { id: string; data: UpdateCategoryRequest }>({
            queryFn: async ({ id, data }) => {
                try {
                    const json = await fetchFromBackend<{ success: boolean; message: string; data: Category }>(
                        `/admin/news-and-events/categories/${id}`,
                        {
                            method: 'PATCH',
                            body: JSON.stringify(data),
                        }
                    );
                    return { data: json.data };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data: error instanceof Error ? error.message : 'Failed to update category',
                        },
                    };
                }
            },
            invalidatesTags: ['Categories'],
        }),

        // Delete category
        deleteCategory: builder.mutation<{ success: boolean }, string>({
            queryFn: async (id) => {
                try {
                    await fetchFromBackend(`/admin/news-and-events/categories/${id}`, { method: 'DELETE' });
                    return { data: { success: true } };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data: error instanceof Error ? error.message : 'Failed to delete category',
                        },
                    };
                }
            },
            invalidatesTags: ['Categories'],
        }),
    }),
});

export const {
    useGetCategoriesQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
} = categoryApi;