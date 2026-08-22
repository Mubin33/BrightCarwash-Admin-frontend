import type { TeamMember, TeamRole, Permission } from "@/types/team";

export const mockTeamMembers: TeamMember[] = [
    {
        id: "cmqgewibz000078tmnjqzlpti",
        name: "Admin User",
        username: "admin",
        email: "admin@email.com",
        avatar: null,
        status: 1,
        role: "Admin",
        roleId: "cmqgeeptx000j10tm5d4ebusk",
        createdAt: "2026-06-16",
    },
    {
        id: "cmqgewimd000178tm03slhusb",
        name: "Manager User",
        username: "manager",
        email: "manager@email.com",
        avatar: null,
        status: 1,
        role: "Manager",
        roleId: "cmqgevqpv000054tmtaeb67rt",
        createdAt: "2026-06-16",
    },
    {
        id: "cmqgi5vs8000068tmry2os1jq",
        name: null,
        username: null,
        email: "pajobi7789@preparmy.com",
        avatar: null,
        status: 1,
        role: "Manager",
        roleId: "cmqgevqpv000054tmtaeb67rt",
        createdAt: "2026-06-16",
    },
    {
        id: "cmqhk1w3x0001q4tmqv1u8ad4",
        name: null,
        username: null,
        email: "kocohi1604@synsky.com",
        avatar: null,
        status: 1,
        role: "Manager",
        roleId: "cmqgevqpv000054tmtaeb67rt",
        createdAt: "2026-06-17",
    },
];

export const mockTeamRoles: TeamRole[] = [
    { id: "cmqgeeptx000j10tm5d4ebusk", name: "Admin" },
    { id: "cmqgevqpv000054tmtaeb67rt", name: "Manager" },
    { id: "rol_003", name: "Staff" },
    { id: "rol_004", name: "View Only" },
];

// Mock permissions with real‑looking IDs (to match the API response pattern)
export const mockPermissions: Permission[] = [
    { id: "perm_dashboard_001", name: "dashboard:view", module: "DASHBOARD" },
    { id: "perm_user_001", name: "user:create", module: "USER" },
    { id: "perm_user_002", name: "user:read", module: "USER" },
    { id: "perm_user_003", name: "user:update", module: "USER" },
    { id: "perm_user_004", name: "user:delete", module: "USER" },
    { id: "perm_role_001", name: "role:create", module: "ROLE" },
    { id: "perm_role_002", name: "role:read", module: "ROLE" },
    { id: "perm_role_003", name: "role:update", module: "ROLE" },
    { id: "perm_role_004", name: "role:delete", module: "ROLE" },
    { id: "perm_template_001", name: "form_template:view", module: "FORM-TEMPLATE" },
    { id: "perm_template_002", name: "form_template:create", module: "FORM-TEMPLATE" },
    { id: "perm_template_003", name: "form_template:update", module: "FORM-TEMPLATE" },
    { id: "perm_template_004", name: "form_template:delete", module: "FORM-TEMPLATE" },
];