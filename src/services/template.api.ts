import { createApi } from '@reduxjs/toolkit/query/react';
import type {
    Template,
    CreateTemplateRequest,
    UpdateTemplateRequest,
    TemplateListResponse,
    TemplateResponse,
} from '@/types/template';
import { APP_CONFIG } from '@/configs/app.config';
import axiosInstance from '@/lib/axios-instance';
import { getAccessToken } from '@/lib/auth-client';

interface GetTemplatesParams {
    search?: string;
    type?: string;
    editorType?: string;
    userId?: string;
    isArchived?: boolean;
    page?: number;
    limit?: number;
}

function transformTemplate(apiTemplate: any): Template {
    let htmlContent = apiTemplate.emailBody?.htmlContent || '';

    if (!htmlContent.trim()) {
        htmlContent = '<div style="padding:20px;color:#666;font-family:sans-serif;">No content available</div>';
    }

    return {
        ...apiTemplate,
        html: htmlContent,
        subject: apiTemplate.emailBody?.subject || 'No subject',
        emailBody: {
            ...apiTemplate.emailBody,
            htmlContent: htmlContent,
        },
    };
}

export const templateApi = createApi({
    reducerPath: 'templateApi',
    baseQuery: async () => ({ data: null }),
    tagTypes: ['Templates', 'Template'],
    endpoints: (builder) => ({
        getTemplates: builder.query<{ templates: Template[]; total: number; totalPages: number }, GetTemplatesParams>({
            queryFn: async (params = {}) => {
                try {
                    const queryParams = new URLSearchParams();
                    if (params.search) queryParams.append('search', params.search);
                    if (params.type) queryParams.append('type', params.type);
                    if (params.editorType) queryParams.append('editorType', params.editorType);
                    if (params.userId) queryParams.append('userId', params.userId);
                    if (params.isArchived !== undefined) queryParams.append('isArchived', String(params.isArchived));
                    if (params.page) queryParams.append('page', String(params.page));
                    if (params.limit) queryParams.append('limit', String(params.limit));

                    const url = `/admin/templates${queryParams.toString() ? `?${queryParams}` : ''}`;
                    const { data } = await axiosInstance.get<TemplateListResponse>(url);
                    return {
                        data: {
                            templates: (data.data || []).map(transformTemplate),
                            total: data.meta?.total || 0,
                            totalPages: data.meta?.totalPages || 1,
                        },
                    };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data: error instanceof Error ? error.message : 'Failed to fetch templates',
                        },
                    };
                }
            },
            providesTags: ['Templates'],
            keepUnusedDataFor: 60,
        }),

        // GET single template by ID
        getTemplateById: builder.query<Template, string>({
            queryFn: async (id) => {
                try {
                    const { data } = await axiosInstance.get<TemplateResponse>(`/admin/templates/${id}`);
                    return { data: transformTemplate(data.data) };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data: error instanceof Error ? error.message : 'Failed to fetch template',
                        },
                    };
                }
            },
            providesTags: (_result, _error, id) => [{ type: 'Template', id }],
            keepUnusedDataFor: 300,
        }),

        // CREATE template
        createTemplate: builder.mutation<Template, CreateTemplateRequest>({
            queryFn: async (templateData) => {
                try {
                    const token = getAccessToken();
                    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/admin/templates`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(templateData),
                    });

                    const responseData = await response.json();

                    if (!response.ok) {
                        return {
                            error: {
                                status: response.status,
                                data: responseData.message || 'Failed to create template',
                            },
                        };
                    }

                    return { data: transformTemplate(responseData.data) };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data: error instanceof Error ? error.message : 'Failed to create template',
                        },
                    };
                }
            },
            invalidatesTags: ['Templates'],
        }),

        // UPDATE template
        updateTemplate: builder.mutation<Template, { id: string; data: UpdateTemplateRequest }>({
            queryFn: async ({ id, data }) => {
                try {
                    const token = getAccessToken();
                    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/admin/templates/${id}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(data),
                    });

                    const responseData = await response.json();

                    if (!response.ok) {
                        return {
                            error: {
                                status: response.status,
                                data: responseData.message || 'Failed to update template',
                            },
                        };
                    }

                    return { data: transformTemplate(responseData.data) };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data: error instanceof Error ? error.message : 'Failed to update template',
                        },
                    };
                }
            },
            invalidatesTags: (_result, _error, { id }) => ['Templates', { type: 'Template', id }],
        }),

        // DELETE template (hard delete)
        deleteTemplate: builder.mutation<{ success: boolean }, string>({
            queryFn: async (id) => {
                try {
                    const token = getAccessToken();
                    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/admin/templates/${id}`, {
                        method: 'DELETE',
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    const responseData = await response.json();

                    if (!response.ok) {
                        return {
                            error: {
                                status: response.status,
                                data: responseData.message || 'Failed to delete template',
                            },
                        };
                    }

                    return { data: { success: true } };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data: error instanceof Error ? error.message : 'Failed to delete template',
                        },
                    };
                }
            },
            invalidatesTags: ['Templates'],
        }),

        // ARCHIVE template (soft delete)
        archiveTemplate: builder.mutation<{ success: boolean }, string>({
            queryFn: async (id) => {
                try {
                    const token = getAccessToken();
                    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/admin/templates/${id}/archive`, {
                        method: 'PATCH',
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    const responseData = await response.json();

                    if (!response.ok) {
                        return {
                            error: {
                                status: response.status,
                                data: responseData.message || 'Failed to archive template',
                            },
                        };
                    }

                    return { data: { success: true } };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data: error instanceof Error ? error.message : 'Failed to archive template',
                        },
                    };
                }
            },
            invalidatesTags: (_result, _error, id) => ['Templates', { type: 'Template', id }],
        }),

        // UPLOAD template image
        uploadTemplateImage: builder.mutation<{ url: string }, File>({
            queryFn: async (file) => {
                try {
                    const token = getAccessToken();
                    const formData = new FormData();
                    formData.append('image', file);

                    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/admin/templates/upload-image`, {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        body: formData,
                    });

                    const responseData = await response.json();

                    if (!response.ok) {
                        return {
                            error: {
                                status: response.status,
                                data: responseData.message || 'Failed to upload image',
                            },
                        };
                    }

                    // Backend returns { url: "https://..." }
                    return { data: responseData };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data: error instanceof Error ? error.message : 'Failed to upload image',
                        },
                    };
                }
            },
        }),
    }),
});

export const {
    useGetTemplatesQuery,
    useGetTemplateByIdQuery,
    useCreateTemplateMutation,
    useUpdateTemplateMutation,
    useDeleteTemplateMutation,
    useArchiveTemplateMutation,
    useUploadTemplateImageMutation,
} = templateApi;