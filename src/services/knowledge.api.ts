import { createApi } from '@reduxjs/toolkit/query/react';
import axiosInstance from '@/lib/axios-instance';
import type {
    KnowledgeFile,
    KnowledgeFileDetail,
    KnowledgeListResponse,
    KnowledgeDetailResponse,
    KnowledgeUploadResponse,
    KnowledgeDeleteResponse,
    UploadKnowledgeRequest,
} from '@/types/knowledge';

const API_BASE = (process.env.NEXT_PUBLIC_AI_BASE_URL || '').replace(/\/$/, '');

export const knowledgeApi = createApi({
    reducerPath: 'knowledgeApi',
    baseQuery: async () => ({ data: null }),
    tagTypes: ['Knowledge'],
    endpoints: (builder) => ({
        getKnowledgeFiles: builder.query<KnowledgeFile[], void>({
            queryFn: async () => {
                try {
                    const response = await axiosInstance.get<KnowledgeListResponse>(
                        `${API_BASE}/admin/kb/`,
                    );
                    return { data: response.data.data };
                } catch (error) {
                    return {
                        error: {
                            status: 'FETCH_ERROR',
                            error: error instanceof Error ? error.message : 'Unable to load knowledge files',
                        },
                    };
                }
            },
            providesTags: ['Knowledge'],
        }),
        getKnowledgeFileDetail: builder.query<KnowledgeFileDetail, number>({
            queryFn: async (id) => {
                try {
                    const response = await axiosInstance.get<KnowledgeDetailResponse>(
                        `${API_BASE}/admin/kb/${id}/`,
                    );
                    return { data: response.data.data };
                } catch (error) {
                    return {
                        error: {
                            status: 'FETCH_ERROR',
                            error: error instanceof Error ? error.message : 'Unable to load file details',
                        },
                    };
                }
            },
        }),
        uploadKnowledgeFile: builder.mutation<KnowledgeFile, UploadKnowledgeRequest>({
            queryFn: async ({ title, file }) => {
                try {
                    const formData = new FormData();
                    formData.append('title', title);
                    formData.append('file', file);

                    const response = await axiosInstance.post<KnowledgeUploadResponse>(
                        `${API_BASE}/admin/kb/upload/`,
                        formData,
                    );
                    return { data: response.data.data };
                } catch (error) {
                    return {
                        error: {
                            status: 'FETCH_ERROR',
                            error: error instanceof Error ? error.message : 'Unable to upload file',
                        },
                    };
                }
            },
            invalidatesTags: ['Knowledge'],
        }),
        deleteKnowledgeFile: builder.mutation<{ success: boolean; message: string }, number>({
            queryFn: async (id) => {
                try {
                    const response = await axiosInstance.delete<KnowledgeDeleteResponse>(
                        `${API_BASE}/admin/kb/${id}/`,
                    );
                    return {
                        data: {
                            success: response.data.success,
                            message: response.data.message
                        }
                    };
                } catch (error) {
                    return {
                        error: {
                            status: 'FETCH_ERROR',
                            error: error instanceof Error ? error.message : 'Unable to delete file',
                        },
                    };
                }
            },
            invalidatesTags: ['Knowledge'],
        }),
    }),
});

export const {
    useGetKnowledgeFilesQuery,
    useGetKnowledgeFileDetailQuery,
    useUploadKnowledgeFileMutation,
    useDeleteKnowledgeFileMutation,
} = knowledgeApi;
