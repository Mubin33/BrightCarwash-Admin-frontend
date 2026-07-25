import { createApi } from '@reduxjs/toolkit/query/react';
import { getAccessToken } from '@/lib/auth-client';
import { APP_CONFIG } from '@/configs/app.config';
import axiosInstance from '@/lib/axios-instance';
import { ProfileFormData } from '@/types/settings';

interface UpdateProfilePayload {
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    address?: string;
    gender?: string;
    dateOfBirth?: string;
    image?: File | null;
}
export interface BusinessProfileData {
    logo: string | null;
    business_name: string;
    tagline: string;
}
export const settingsApi = createApi({
    reducerPath: 'settingsApi',
    baseQuery: async () => ({ data: null }),
    tagTypes: ['Profile', 'BusinessProfile'],
    endpoints: (builder) => ({
        uploadAvatar: builder.mutation<string, File>({
            queryFn: async (file) => {
                try {
                    const token = getAccessToken();
                    const formData = new FormData();
                    formData.append('files', file);

                    const res = await fetch(`${APP_CONFIG.API_BASE_URL}/admin/files/upload`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}` },
                        body: formData,
                    });

                    if (!res.ok) throw new Error('Failed to upload');
                    const json = await res.json();
                    const uploaded = json.data?.[0] || json.data;
                    return { data: uploaded.url || uploaded.path || uploaded.fileUrl || '' };
                } catch (error) {
                    return { error: { status: 500, data: 'Upload failed' } };
                }
            },
        }),
        getProfile: builder.query<ProfileFormData, void>({
            queryFn: async () => {
                try {
                    const res = await axiosInstance.get('/auth/me');
                    const data = res.data.data;

                    return {
                        data: {
                            first_name: data.first_name || '',
                            last_name: data.last_name || '',
                            email: data.email || '',
                            phone: data.phone_number || data.phoneNumber || '',
                            avatar: (data.avatar_url || data.avatar || null),
                        },
                    };
                } catch (error) {
                    return { error: { status: 500, data: 'Failed to fetch profile' } };
                }
            },
            providesTags: ['Profile'],
        }),

        updateProfile: builder.mutation<null, UpdateProfilePayload>({
            queryFn: async (payload) => {
                try {
                    const formData = new FormData();
                    formData.append('firstName', payload.firstName);
                    formData.append('lastName', payload.lastName);
                    if (payload.phoneNumber) formData.append('phoneNumber', payload.phoneNumber);
                    if (payload.address) formData.append('address', payload.address);
                    if (payload.gender) formData.append('gender', payload.gender);
                    if (payload.dateOfBirth) formData.append('dateOfBirth', payload.dateOfBirth);
                    if (payload.image) formData.append('image', payload.image);

                    await axiosInstance.patch('/auth/update', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    return { data: null };
                } catch (error) {
                    return { error: { status: 500, data: 'Update failed' } };
                }
            },
            invalidatesTags: ['Profile'],
        }),

        changePassword: builder.mutation<null, { old_password: string; new_password: string }>({
            queryFn: async (data) => {
                try {
                    await axiosInstance.post('/auth/change-password', data);
                    return { data: null };
                } catch (error: any) {
                    const message = error?.response?.data?.message || 'Password change failed';
                    return { error: { status: error?.response?.status || 500, data: message } };
                }
            },
        }),
        getBusinessProfile: builder.query<BusinessProfileData, void>({
            queryFn: async () => {
                try {
                    const res = await axiosInstance.get('/admin/sections/business_profile');
                    const content = res.data.data?.content || {};

                    return {
                        data: {
                            logo: content.logo || null,
                            business_name: content.business_name || '',
                            tagline: content.tagline || '',
                        },
                    };
                } catch (error) {

                    return {
                        data: { logo: null, business_name: '', tagline: '' },
                    };
                }
            },
            providesTags: ['BusinessProfile'],
        }),

        updateBusinessProfile: builder.mutation<null, BusinessProfileData>({
            queryFn: async (payload) => {
                try {
                    await axiosInstance.patch('/admin/sections/business_profile', {
                        section_type: 'business_profile',
                        content: {
                            logo: payload.logo,
                            business_name: payload.business_name,
                            tagline: payload.tagline,
                        },
                    });
                    return { data: null };
                } catch (error) {
                    return { error: { status: 500, data: 'Update failed' } };
                }
            },
            invalidatesTags: ['BusinessProfile'],
        }),

    }),

});

export const {
    useUploadAvatarMutation,
    useUpdateProfileMutation,
    useChangePasswordMutation,
    useGetProfileQuery,
    useGetBusinessProfileQuery,
    useUpdateBusinessProfileMutation,
} = settingsApi;