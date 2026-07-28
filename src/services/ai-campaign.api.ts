import { createApi } from '@reduxjs/toolkit/query/react';
import { getAccessToken } from '@/lib/auth-client';
import axios from 'axios';
import type {
    Campaign,
    CampaignListResponse,
    CampaignDetailResponse,
    CampaignCreateResponse,
    CampaignDeleteResponse,
    CreateCampaignRequest,
    UpdateCampaignRequest
} from '@/types/ai-campaign';

const API_BASE = process.env.NEXT_PUBLIC_AI_BASE_URL?.replace(/\/$/, '');

export const aiCampaignApi = createApi({
    reducerPath: 'aiCampaignApi',
    baseQuery: async () => ({ data: null }),
    tagTypes: ['AiCampaign'],
    endpoints: (builder) => ({
        getCampaigns: builder.query<Campaign[], void>({
            queryFn: async () => {
                try {
                    const response = await axios.get<CampaignListResponse>(
                        `${API_BASE}/api/v1/admin/campaigns/`,
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${getAccessToken()}`,
                            },
                        }
                    );
                    return { data: response.data.data };
                } catch (error) {
                    return {
                        error: {
                            status: 'FETCH_ERROR',
                            error: error instanceof Error ? error.message : 'Unable to load campaigns',
                        },
                    };
                }
            },
            providesTags: ['AiCampaign'],
        }),
        getCampaignDetail: builder.query<Campaign, number>({
            queryFn: async (id) => {
                try {
                    const response = await axios.get<CampaignDetailResponse>(
                        `${API_BASE}/api/v1/admin/campaigns/${id}/`,
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${getAccessToken()}`,
                            },
                        }
                    );
                    return { data: response.data.data };
                } catch (error) {
                    return {
                        error: {
                            status: 'FETCH_ERROR',
                            error: error instanceof Error ? error.message : 'Unable to load campaign details',
                        },
                    };
                }
            },
        }),
        createCampaign: builder.mutation<Campaign, CreateCampaignRequest>({
            queryFn: async (payload) => {
                try {
                    const formData = new FormData();
                    formData.append('title', payload.title);
                    formData.append('description', payload.description);
                    if (payload.image) formData.append('image', payload.image);
                    if (payload.is_active !== undefined) formData.append('is_active', String(payload.is_active));
                    if (payload.start_date) formData.append('start_date', payload.start_date);
                    if (payload.end_date) formData.append('end_date', payload.end_date);

                    const response = await axios.post<CampaignCreateResponse>(
                        `${API_BASE}/api/v1/admin/campaigns/`,
                        formData,
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                                Authorization: `Bearer ${getAccessToken()}`,
                            },
                        }
                    );
                    return { data: response.data.data };
                } catch (error) {
                    return {
                        error: {
                            status: 'FETCH_ERROR',
                            error: error instanceof Error ? error.message : 'Unable to create campaign',
                        },
                    };
                }
            },
            invalidatesTags: ['AiCampaign'],
        }),
        updateCampaign: builder.mutation<Campaign, UpdateCampaignRequest & { id: number }>({
            queryFn: async ({ id, ...payload }) => {
                try {
                    const formData = new FormData();
                    if (payload.title) formData.append('title', payload.title);
                    if (payload.description) formData.append('description', payload.description);
                    if (payload.image) formData.append('image', payload.image);
                    if (payload.is_active !== undefined) formData.append('is_active', String(payload.is_active));
                    if (payload.start_date) formData.append('start_date', payload.start_date);
                    if (payload.end_date) formData.append('end_date', payload.end_date);

                    const response = await axios.patch<CampaignCreateResponse>(
                        `${API_BASE}/api/v1/admin/campaigns/${id}/`,
                        formData,
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                                Authorization: `Bearer ${getAccessToken()}`,
                            },
                        }
                    );
                    return { data: response.data.data };
                } catch (error) {
                    return {
                        error: {
                            status: 'FETCH_ERROR',
                            error: error instanceof Error ? error.message : 'Unable to update campaign',
                        },
                    };
                }
            },
            invalidatesTags: ['AiCampaign'],
        }),
        deleteCampaign: builder.mutation<{ success: boolean; message: string }, number>({
            queryFn: async (id) => {
                try {
                    const response = await axios.delete<CampaignDeleteResponse>(
                        `${API_BASE}/api/v1/admin/campaigns/${id}/`,
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${getAccessToken()}`,
                            },
                        }
                    );
                    return {
                        data: {
                            success: response.data.success,
                            message: response.data.message,
                        },
                    };
                } catch (error) {
                    return {
                        error: {
                            status: 'FETCH_ERROR',
                            error: error instanceof Error ? error.message : 'Unable to delete campaign',
                        },
                    };
                }
            },
            invalidatesTags: ['AiCampaign'],
        }),
    }),
});

export const {
    useGetCampaignsQuery,
    useGetCampaignDetailQuery,
    useCreateCampaignMutation,
    useUpdateCampaignMutation,
    useDeleteCampaignMutation,
} = aiCampaignApi;