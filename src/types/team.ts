export interface TeamMember {
    id: string;
    name: string | null;
    username: string | null;
    email: string;
    avatar: string | null;
    status: number;
    role: string;
    roleId: string;
    createdAt: string;
    first_name?: string;
    last_name?: string
}

export interface TeamRole {
    id: string;
    name: string;
    description?: string;
}

export interface Permission {
    id: string;
    name: string;
    module: string;
}

export interface PermissionItem {
    id: string;
    action: string;
}

export type PermissionsMap = Record<string, { id?: string; action: string }[]>;

export interface PermissionsApiResponse {
    success: boolean;
    message: string;
    data: PermissionsMap;
}

export interface TeamMemberResponse {
    id: string;
    name: string | null;
    username: string | null;
    email: string;
    avatar: string | null;
    status: number;
    created_at: string;
    roleUsers: {
        user_id: string;
        role_id: string;
        role: {
            id: string; name: string;

        };
    }[];
    first_name?: string;
    last_name?: string
}

export interface MembersApiResponse {
    success: boolean;
    message: string;
    data: TeamMemberResponse[];
    meta: {
        totalItems: number;
        itemCount: number;
        itemsPerPage: number;
        totalPages: number;
        currentPage: number;
        hasPreviousPage: boolean;
        hasNextPage: boolean;
    };
}

export interface RoleDetailResponse {
    success: boolean;
    message: string;
    data: {
        id: string;
        name: string;
        description: string | null;
        created_at: string;
        updated_at: string;
        permissions: {
            role_id: string;
            permission_id: string;
            permission: {
                id: string;
                name: string;
                description: string;
            };
        }[];
    };
}