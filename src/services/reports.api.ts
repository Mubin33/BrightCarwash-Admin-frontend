import { createApi } from '@reduxjs/toolkit/query/react';
import type {
    StageSummaryData,
    StageBreakdownItem,
    LeadSourceItem,
    CampaignTableResponse,
    CampaignHighlight,
    MemberActivityHighlights,
    MemberTableRow,
} from '@/types/reports';
import { APP_CONFIG } from '@/configs/app.config';
import axiosInstance from '@/lib/axios-instance';

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export const reportsApi = createApi({
    reducerPath: 'reportsApi',
    baseQuery: async () => ({ data: null }),
    tagTypes: ['Reports'],
    endpoints: (builder) => ({
        getStageSummary: builder.query<StageSummaryData, { stageName: string; startDate: string; endDate: string }>({
            queryFn: async (params) => {
                try {
                    // if (APP_CONFIG.MOCK_MODE) {
                    //     await delay(APP_CONFIG.MOCK_DELAY_MS);
                    //     return { data: mockStageSummary };
                    // }
                    const { data } = await axiosInstance.get('/admin/reports/leads/stage-summary', { params });
                    return { data: data.data };
                } catch {
                    return { error: { status: 500, data: 'Failed' } };
                }
            },
            providesTags: ['Reports'],
        }),
        getStageBreakdown: builder.query<StageBreakdownItem[], { stages: string[] }>({
            queryFn: async (body) => {
                try {
                    if (process.env.NODE_ENV !== "production" && APP_CONFIG.MOCK_MODE) {
                        await delay(APP_CONFIG.MOCK_DELAY_MS);
                        const { mockStageBreakdown } = await import('@/mocks/reports.mock');
                        return { data: mockStageBreakdown.filter((s) => body.stages.includes(s.stageName)) };
                    }
                    const { data } = await axiosInstance.post('/admin/reports/leads/stage-breakdown', body);
                    return { data: data.data };
                } catch {
                    return { error: { status: 500, data: 'Failed' } };
                }
            },
            providesTags: ['Reports'],
        }),
        getLeadSources: builder.query<LeadSourceItem[], { startDate: string; endDate: string }>({
            queryFn: async (params) => {
                try {
                    if (process.env.NODE_ENV !== "production" && APP_CONFIG.MOCK_MODE) {
                        await delay(APP_CONFIG.MOCK_DELAY_MS);
                        const { mockLeadSources } = await import('@/mocks/reports.mock');
                        return { data: mockLeadSources };
                    }
                    const { data } = await axiosInstance.get('/admin/reports/leads/sources', { params });
                    return { data: data.data.eachCount };
                } catch {
                    return { error: { status: 500, data: 'Failed' } };
                }
            },
            providesTags: ['Reports'],
        }),
        // Inside endpoints:

        getCampaignHighlights: builder.query<CampaignHighlight[], { startDate: string; endDate: string }>({
            queryFn: async (params) => {
                try {
                    const { data } = await axiosInstance.get('/admin/reports/campaigns/highlights', { params });
                    return { data: data.data };
                } catch {
                    return { error: { status: 500, data: 'Failed' } };
                }
            },
        }),

        getCampaignTable: builder.query<CampaignTableResponse, { page: number; limit: number; search?: string; startDate: string; endDate: string }>({
            queryFn: async (params) => {
                try {
                    const { data } = await axiosInstance.get('/admin/reports/campaigns/table', { params });
                    return { data: data.data };
                } catch {
                    return { error: { status: 500, data: 'Failed' } };
                }
            },
        }),
        // Inside endpoints:

        getMemberHighlights: builder.query<MemberActivityHighlights, { startDate: string; endDate: string }>({
            queryFn: async (params) => {
                try {
                    const { data } = await axiosInstance.get('/admin/reports/member-activity/highlights', { params });
                    return { data: data.data };
                } catch {
                    return { error: { status: 500, data: 'Failed' } };
                }
            },
        }),

        getMemberTable: builder.query<{ data: MemberTableRow[]; meta: { totalItems: number; itemCount: number; itemsPerPage: number; totalPages: number; currentPage: number } }, { page: number; limit: number; search?: string; startDate?: string; endDate?: string }>({
            queryFn: async (params) => {
                try {
                    const { data } = await axiosInstance.get('/admin/reports/member-activity/table', { params });
                    return { data: data.data };
                } catch {
                    return { error: { status: 500, data: 'Failed' } };
                }
            },
        }),
    }),

});

export const {
    useGetStageSummaryQuery,
    useGetStageBreakdownQuery,
    useGetLeadSourcesQuery,
    useGetCampaignHighlightsQuery,
    useGetCampaignTableQuery,
    useGetMemberHighlightsQuery,
    useGetMemberTableQuery,
} = reportsApi;
