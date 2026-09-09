"use client";

import { AddMemberModal } from "@/components/pages/teams/AddMemberModal";
import { CreateRoleModal } from "@/components/pages/teams/CreateRoleModal";
import { EditPermissionsModal } from "@/components/pages/teams/EditPermissionsModal";
import type { TeamRole, Permission } from "@/types/team";

interface TeamsModalsProps {
    addMemberOpen: boolean;
    onAddMemberClose: () => void;
    createRoleOpen: boolean;
    onCreateRoleClose: () => void;
    editRole: TeamRole | null;
    onEditRoleClose: () => void;
    roles: TeamRole[];
    permissions: Permission[];
    rolePermissions: string[];
    onMemberAdded: () => void;
    onRoleCreated: () => void;
    onSavePermissions: (roleId: string, perms: string[]) => void;
}

export function TeamsModals({
    addMemberOpen,
    onAddMemberClose,
    createRoleOpen,
    onCreateRoleClose,
    editRole,
    onEditRoleClose,
    roles,
    permissions,
    rolePermissions,
    onMemberAdded,
    onRoleCreated,
    onSavePermissions,
}: TeamsModalsProps) {
    return (
        <>
            <AddMemberModal
                isOpen={addMemberOpen}
                onClose={onAddMemberClose}
                roles={roles}
                onMemberAdded={onMemberAdded}
            />
            <CreateRoleModal
                isOpen={createRoleOpen}
                onClose={onCreateRoleClose}
                onRoleCreated={onRoleCreated}
            />
            {editRole && (
                <EditPermissionsModal
                    isOpen={!!editRole}
                    onClose={onEditRoleClose}
                    role={editRole}
                    allPermissions={permissions}
                    selectedPermissions={rolePermissions}
                    onSave={onSavePermissions}
                />
            )}
        </>
    );
}