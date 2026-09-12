import { createApi } from '@reduxjs/toolkit/query/react';
import type {
    Testimonial,
    CreateTestimonialRequest,
    UpdateTestimonialRequest,
    TestimonialListResponse,
    TestimonialSingleResponse,
} from '@/types/testimonial';
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

export const testimonialApi = createApi({
    reducerPath: 'testimonialApi',
    baseQuery: async () => ({ data: null }),
    tagTypes: ['Testimonials'],
    endpoints: (builder) => ({
        // Get all testimonials
        getTestimonials: builder.query<Testimonial[], { search?: string; is_active?: boolean; sort_by?: string; sort_order?: string; page?: number; limit?: number }>({
            queryFn: async (params = {}) => {
                try {
                    const queryParams = new URLSearchParams();
                    if (params.search) queryParams.append('search', params.search);
                    if (params.is_active !== undefined) queryParams.append('is_active', String(params.is_active));
                    if (params.sort_by) queryParams.append('sort_by', params.sort_by || 'created_at');
                    if (params.sort_order) queryParams.append('sort_order', params.sort_order || 'desc');
                    if (params.page) queryParams.append('page', String(params.page || 1));
                    if (params.limit) queryParams.append('limit', String(params.limit || 50));

                    const url = `/admin/testimonials${queryParams.toString() ? `?${queryParams}` : ''}`;
                    const json = await fetchFromBackend<TestimonialListResponse>(url);
                    return { data: json.data.testimonials || [] };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data: error instanceof Error ? error.message : 'Failed to fetch testimonials',
                        },
                    };
                }
            },
            providesTags: ['Testimonials'],
        }),

        // Get single testimonial
        getTestimonialById: builder.query<Testimonial, string>({
            queryFn: async (id) => {
                try {
                    const json = await fetchFromBackend<TestimonialSingleResponse>(`/admin/testimonials/${id}`);
                    return { data: json.data };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data: error instanceof Error ? error.message : 'Failed to fetch testimonial',
                        },
                    };
                }
            },
            providesTags: (_result, _error, id) => [{ type: 'Testimonials', id }],
        }),

        // Create testimonial
        createTestimonial: builder.mutation<Testimonial, CreateTestimonialRequest>({
            queryFn: async (body) => {
                try {
                    const formData = new FormData();
                    formData.append('name', body.name);
                    formData.append('designation', body.designation);
                    formData.append('ratings', String(body.ratings));
                    formData.append('review_text', body.review_text);
                    if (body.avatar_image) formData.append('avatar_image', body.avatar_image);
                    if (body.is_active !== undefined) {
                        formData.append('is_active', String(body.is_active));
                    }

                    const token = getAccessToken();
                    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/admin/testimonials`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}` },
                        body: formData,
                    });
                    if (!res.ok) throw new Error('Failed to create testimonial');
                    const json = await res.json();
                    return { data: json.data };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data: error instanceof Error ? error.message : 'Failed to create testimonial',
                        },
                    };
                }
            },
            invalidatesTags: ['Testimonials'],
        }),

        // Update testimonial
        updateTestimonial: builder.mutation<Testimonial, { id: string; data: UpdateTestimonialRequest }>({
            queryFn: async ({ id, data }) => {
                try {
                    const formData = new FormData();
                    if (data.name) formData.append('name', data.name);
                    if (data.designation) formData.append('designation', data.designation);
                    if (data.ratings !== undefined) formData.append('ratings', String(data.ratings));
                    if (data.review_text) formData.append('review_text', data.review_text);
                    if (data.avatar_image) formData.append('avatar_image', data.avatar_image);
                    if (data.is_active !== undefined) {
                        formData.append('is_active', String(data.is_active));
                    }
                    if (data.is_avatar_deleted !== undefined) {
                        formData.append('is_avatar_deleted', String(data.is_avatar_deleted));
                    }

                    const token = getAccessToken();
                    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/admin/testimonials/${id}`, {
                        method: 'PATCH',
                        headers: { Authorization: `Bearer ${token}` },
                        body: formData,
                    });
                    if (!res.ok) throw new Error('Failed to update testimonial');
                    const json = await res.json();
                    return { data: json.data };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data: error instanceof Error ? error.message : 'Failed to update testimonial',
                        },
                    };
                }
            },
            invalidatesTags: (_result, _error, { id }) => ['Testimonials', { type: 'Testimonials', id }],
        }),

        // Delete testimonial
        deleteTestimonial: builder.mutation<{ success: boolean }, string>({
            queryFn: async (id) => {
                try {
                    await fetchFromBackend(`/admin/testimonials/${id}`, { method: 'DELETE' });
                    return { data: { success: true } };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data: error instanceof Error ? error.message : 'Failed to delete testimonial',
                        },
                    };
                }
            },
            invalidatesTags: ['Testimonials'],
        }),
    }),
});

export const {
    useGetTestimonialsQuery,
    useGetTestimonialByIdQuery,
    useCreateTestimonialMutation,
    useUpdateTestimonialMutation,
    useDeleteTestimonialMutation,
} = testimonialApi;