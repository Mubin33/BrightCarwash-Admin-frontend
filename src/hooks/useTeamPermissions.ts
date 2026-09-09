"use client";

import { useCallback } from "react";
import { toast } from "react-toastify";
import { useUpdateRolePermissionsMutation } from "@/services/team.api";

export function useTeamPermissions() {
    const [updateRolePermissions] = useUpdateRolePermissionsMutation();

    const handleSavePermissions = useCallback(
        async (roleId: string, perms: string[]) => {
            try {
                const result = await updateRolePermissions({
                    id: roleId,
                    permissions: perms,
                }).unwrap();

                if (result.success) {
                    toast.success(result.message || "Permissions updated successfully");
                } else {
                    toast.error(result.message || "Failed to update permissions");
                }
                return true;
            } catch (error: any) {
                console.error("Error updating permissions:", error);
                toast.error(error?.data || "Failed to save permissions");
                return false;
            }
        },
        [updateRolePermissions]
    );

    return { handleSavePermissions };
}