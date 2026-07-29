import { createApi } from "@reduxjs/toolkit/query/react";
import type {
    TeamMember,
    TeamRole,
    Permission,
    MembersApiResponse,
    PermissionsMap,
    RoleDetailResponse,
} from "@/types/team";
import { APP_CONFIG } from "@/configs/app.config";
import {
    mockTeamMembers,
    mockTeamRoles,
    mockPermissions,
} from "@/mocks/team.mock";
import axiosInstance from "@/lib/axios-instance";
import { getAccessToken } from "@/lib/auth-client";

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function mapMember(data: MembersApiResponse["data"][0]): TeamMember {
    return {
        id: data.id,
        name: `${data.first_name || ""} ${data.last_name || ""}`.trim() || null,
        username: null,
        email: data.email,
        avatar: data.avatar,
        status: data.status,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.roleUsers?.[0]?.role?.name || "Staff",
        roleId: data.roleUsers?.[0]?.role?.id || "",
        createdAt: data.created_at?.split("T")[0] || "",
    };
}

function mapPermissions(data: PermissionsMap): Permission[] {
    const result: Permission[] = [];
    for (const [module, items] of Object.entries(data)) {
        for (const item of items) {
            result.push({
                id: (item as any).id || `${module}:${item.action}`,
                name: `${module}:${item.action}`,
                module,
            });
        }
    }
    return result;
}

export const teamApi = createApi({
    reducerPath: "teamApi",
    baseQuery: async () => ({ data: null }),
    tagTypes: ["TeamMembers", "TeamRoles"],
    endpoints: (builder) => ({
        getTeamMembers: builder.query<
            { members: TeamMember[]; meta: MembersApiResponse['meta'] },
            { search?: string; page?: number; limit?: number }
        >({
            queryFn: async (params = {}) => {
                try {
                    if (APP_CONFIG.MOCK_MODE) {
                        await delay(APP_CONFIG.MOCK_DELAY_MS);
                        return { data: { members: mockTeamMembers, meta: { totalItems: 0, itemCount: 0, itemsPerPage: 10, totalPages: 1, currentPage: 1, hasNextPage: false, hasPreviousPage: false } } };
                    }
                    const queryParams = new URLSearchParams();
                    if (params.search) queryParams.append('search', params.search);
                    if (params.page) queryParams.append('page', String(params.page));
                    if (params.limit) queryParams.append('limit', String(params.limit));

                    const url = `/admin/members${queryParams.toString() ? `?${queryParams}` : ''}`;
                    const { data } = await axiosInstance.get<MembersApiResponse>(url);
                    return { data: { members: data.data.map(mapMember), meta: data.meta } };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data: error instanceof Error ? error.message : "Failed to fetch members",
                        },
                    };
                }
            },
            providesTags: ["TeamMembers"],
            keepUnusedDataFor: 60,
        }),
        resendInvite: builder.mutation<{ success: boolean }, string>({
            queryFn: async (email) => {
                try {

                    const token = getAccessToken();
                    const response = await fetch(
                        `${APP_CONFIG.API_BASE_URL}/auth/resend-invite`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ email }),
                        }
                    );

                    const responseData = await response.json();

                    if (!response.ok) {
                        return {
                            error: {
                                status: response.status,
                                data: responseData.message || 'Failed to resend invite',
                            },
                        };
                    }

                    return { data: { success: true } };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data: error instanceof Error ? error.message : 'Failed to resend invite',
                        },
                    };
                }
            },
            invalidatesTags: ['TeamMembers'],
        }),

        getTeamRoles: builder.query<TeamRole[], void>({
            queryFn: async () => {
                try {
                    if (APP_CONFIG.MOCK_MODE) {
                        await delay(APP_CONFIG.MOCK_DELAY_MS);
                        return { data: [...mockTeamRoles] };
                    }
                    const res = await axiosInstance.get<{
                        success: boolean;
                        data: TeamRole[];
                    }>("/admin/role");
                    return { data: res.data.data };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data:
                                error instanceof Error ? error.message : "Failed to fetch roles",
                        },
                    };
                }
            },
            providesTags: ["TeamRoles"],
            keepUnusedDataFor: 300, // cache 5 minutes (roles are semi‑static)
        }),


        getPermissions: builder.query<Permission[], void>({
            queryFn: async () => {
                try {
                    if (APP_CONFIG.MOCK_MODE) {
                        await delay(APP_CONFIG.MOCK_DELAY_MS);
                        return { data: [...mockPermissions] };
                    }
                    const res = await axiosInstance.get<{
                        success: boolean;
                        data: PermissionsMap;
                    }>("/admin/role/permissions");
                    return { data: mapPermissions(res.data.data) };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data:
                                error instanceof Error
                                    ? error.message
                                    : "Failed to fetch permissions",
                        },
                    };
                }
            },
            keepUnusedDataFor: 3600, // 1 hour – permissions rarely change
        }),


        getRoleById: builder.query<string[], string>({
            queryFn: async (name) => {
                try {
                    if (APP_CONFIG.MOCK_MODE) {
                        await delay(APP_CONFIG.MOCK_DELAY_MS);
                        const mockPermIds = mockPermissions.slice(0, 5).map((p) => p.id);
                        return { data: mockPermIds };
                    }
                    const res = await axiosInstance.get<RoleDetailResponse>(
                        `/admin/role/${name}`
                    );
                    const permIds = res.data.data.permissions.map(
                        (p) => p.permission.id
                    );
                    return { data: permIds };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data:
                                error instanceof Error ? error.message : "Failed to fetch role",
                        },
                    };
                }
            },
            providesTags: (_result, _error, name) => [{ type: "TeamRoles", id: name }],
            keepUnusedDataFor: 300, // 5 minutes
        }),


        updateRolePermissions: builder.mutation<
            { success: boolean; message: string; data?: any },
            { id: string; permissions: string[] }
        >({
            queryFn: async ({ id, permissions }) => {
                try {
                    if (APP_CONFIG.MOCK_MODE) {
                        await delay(APP_CONFIG.MOCK_DELAY_MS);
                        return {
                            data: {
                                success: true,
                                message: "Role updated successfully (mock)",
                                data: { id, permissions },
                            },
                        };
                    }

                    const token = getAccessToken();
                    if (!token) {
                        return {
                            error: { status: 401, data: "No access token found" },
                        };
                    }

                    const response = await fetch(
                        `${APP_CONFIG.API_BASE_URL}/admin/role/${id}`,
                        {
                            method: "PATCH",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ permissionIds: permissions }),
                        }
                    );

                    const responseData = await response.json();

                    if (!response.ok) {
                        return {
                            error: {
                                status: response.status,
                                data: responseData.message || "Failed to update permissions",
                            },
                        };
                    }

                    return { data: responseData };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data:
                                error instanceof Error ? error.message : "Failed to update permissions",
                        },
                    };
                }
            },
            // Invalidate only the specific role’s permissions, not the whole list
            invalidatesTags: (_result, _error, { id }) => [{ type: "TeamRoles", id }],
        }),

        updateMemberRole: builder.mutation<{ success: boolean }, { id: string; roleNames: string[] }>({
            queryFn: async ({ id, roleNames }) => {
                try {
                    if (APP_CONFIG.MOCK_MODE) {
                        await delay(APP_CONFIG.MOCK_DELAY_MS);
                        const member = mockTeamMembers.find((m) => m.id === id);
                        if (member) member.role = roleNames[0] || member.role;
                        return { data: { success: true } };
                    }
                    await axiosInstance.put(`/admin/members/${id}/roles`, { roleNames });
                    return { data: { success: true } };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data: error instanceof Error ? error.message : "Failed to update role",
                        },
                    };
                }
            },
            invalidatesTags: ["TeamMembers"],
        }),

        blockMember: builder.mutation<{ success: boolean }, string>({
            queryFn: async (id) => {
                try {
                    if (APP_CONFIG.MOCK_MODE) {
                        await delay(APP_CONFIG.MOCK_DELAY_MS);
                        const member = mockTeamMembers.find((m) => m.id === id);
                        if (member) member.status = 0;
                        return { data: { success: true } };
                    }
                    await axiosInstance.put(`/admin/members/${id}/block`);
                    return { data: { success: true } };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data: error instanceof Error ? error.message : "Failed to block member",
                        },
                    };
                }
            },
            invalidatesTags: ["TeamMembers"],
        }),

        unblockMember: builder.mutation<{ success: boolean }, string>({
            queryFn: async (id) => {
                try {
                    if (APP_CONFIG.MOCK_MODE) {
                        await delay(APP_CONFIG.MOCK_DELAY_MS);
                        const member = mockTeamMembers.find((m) => m.id === id);
                        if (member) member.status = 1;
                        return { data: { success: true } };
                    }
                    await axiosInstance.put(`/admin/members/${id}/unblock`);
                    return { data: { success: true } };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data: error instanceof Error ? error.message : "Failed to unblock member",
                        },
                    };
                }
            },
            invalidatesTags: ["TeamMembers"],
        }),
        deleteRole: builder.mutation<{ success: boolean }, string>({
            queryFn: async (id) => {
                try {
                    await axiosInstance.delete(`/admin/role/${id}`);
                    return { data: { success: true } };
                } catch (error) {
                    return {
                        error: {
                            status: 500,
                            data: error instanceof Error ? error.message : "Failed to delete role",
                        },
                    };
                }
            },
            invalidatesTags: ["TeamRoles"],
        }),
    }),
});

export const {
    useGetTeamMembersQuery,
    useGetTeamRolesQuery,
    useGetPermissionsQuery,
    useGetRoleByIdQuery,
    useLazyGetRoleByIdQuery,
    useUpdateRolePermissionsMutation,
    useUpdateMemberRoleMutation,
    useBlockMemberMutation,
    useUnblockMemberMutation,
    useDeleteRoleMutation,
    useResendInviteMutation
} = teamApi;