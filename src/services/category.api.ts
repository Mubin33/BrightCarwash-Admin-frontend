import { createApi } from '@reduxjs/toolkit/query/react';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest, CategoryListResponse } from '@/types/news';
import { fetchFromBackend } from '@/lib/api-fetch';

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