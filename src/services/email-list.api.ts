import { apiFetch } from '@/lib/api-fetch';
import { createApi } from '@reduxjs/toolkit/query/react';
import type { EmailLog, EmailLogListResponse, EmailLogDetailResponse } from '@/types/email-list';

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
                                        const queryParams = new URLSearchParams();
                    if (params.page) queryParams.append('page', String(params.page));
                    if (params.limit) queryParams.append('limit', String(params.limit));
                    if (params.search) queryParams.append('search', params.search);

                    const url = `/admin/mail-management/logs${queryParams.toString() ? `?${queryParams}` : ''}`;
                    const res = await apiFetch(url);

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
                    const res = await apiFetch(`/admin/mail-management/logs/${id}`);
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
                    const res = await apiFetch(`/admin/mail-management/logs/${id}`, {
                        method: 'DELETE',
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
                                        const formData = new FormData();
                    formData.append('to', to);
                    formData.append('subject', subject);
                    formData.append('body', body);
                    if (cc?.length) formData.append('cc', cc.join(','));
                    if (bcc?.length) formData.append('bcc', bcc.join(','));
                    if (files?.length) {
                        files.forEach((file) => formData.append('files', file));
                    }

                    const res = await apiFetch('/admin/mail-management/send', {
                        method: 'POST',
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