import { createApi } from '@reduxjs/toolkit/query/react';
import type { EmailLog, EmailLogListResponse, EmailLogDetailResponse } from '@/types/email-list';
import { getAccessToken } from '@/lib/auth-client';
import { APP_CONFIG } from '@/configs/app.config';

interface GetLogsParams {
    page?: number;
    limit?: number;
    search?: string;
}

interface SendEmailParams {
    to: string;
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    files?: File[];
}

export const emailListApi = createApi({
    reducerPath: 'emailListApi',
    baseQuery: async () => ({ data: null }),
    tagTypes: ['EmailLogs'],
    endpoints: (builder) => ({
        getEmailLogs: builder.query<EmailLogListResponse, GetLogsParams>({
            queryFn: async (params = {}) => {
                try {
                    const token = getAccessToken();
                    const queryParams = new URLSearchParams();
                    if (params.page) queryParams.append('page', String(params.page));
                    if (params.limit) queryParams.append('limit', String(params.limit));
                    if (params.search) queryParams.append('search', params.search);

                    const url = `/admin/mail-management/logs${queryParams.toString() ? `?${queryParams}` : ''}`;
                    const res = await fetch(`${APP_CONFIG.API_BASE_URL}${url}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
                    const json = await res.json();
                    return { data: json };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data: error instanceof Error ? error.message : 'Failed to fetch email logs',
                        },
                    };
                }
            },
            providesTags: ['EmailLogs'],
        }),

        getEmailLogById: builder.query<EmailLog, string>({
            queryFn: async (id) => {
                try {
                    const token = getAccessToken();
                    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/admin/mail-management/logs/${id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
                    const json: EmailLogDetailResponse = await res.json();
                    return { data: json.data };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data: error instanceof Error ? error.message : 'Failed to fetch email log',
                        },
                    };
                }
            },
        }),

        deleteEmailLog: builder.mutation<{ success: boolean }, string>({
            queryFn: async (id) => {
                try {
                    const token = getAccessToken();
                    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/admin/mail-management/logs/${id}`, {
                        method: 'DELETE',
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
                    const json = await res.json();
                    return { data: json };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data: error instanceof Error ? error.message : 'Failed to delete email log',
                        },
                    };
                }
            },
            invalidatesTags: ['EmailLogs'],
        }),

        sendEmail: builder.mutation<{ success: boolean; message: string }, SendEmailParams>({
            queryFn: async ({ to, cc, bcc, subject, body, files }) => {
                try {
                    const token = getAccessToken();
                    const formData = new FormData();
                    formData.append('to', to);
                    formData.append('subject', subject);
                    formData.append('body', body);
                    if (cc?.length) formData.append('cc', cc.join(','));
                    if (bcc?.length) formData.append('bcc', bcc.join(','));
                    if (files?.length) {
                        files.forEach((file) => formData.append('files', file));
                    }

                    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/admin/mail-management/send`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}` },
                        body: formData,
                    });

                    if (!res.ok) {
                        const errorData = await res.json().catch(() => ({}));
                        throw new Error(errorData.message || 'Failed to send email');
                    }
                    const json = await res.json();
                    return { data: json };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data: error instanceof Error ? error.message : 'Failed to send email',
                        },
                    };
                }
            },
            invalidatesTags: ['EmailLogs'],
        }),
    }),
});

export const {
    useGetEmailLogsQuery,
    useGetEmailLogByIdQuery,
    useDeleteEmailLogMutation,
    useSendEmailMutation,
} = emailListApi;