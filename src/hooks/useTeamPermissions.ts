"use client";

import { useAppDispatch, useAppSelector } from "@/lib/store";
import * as authService from "@/services/auth.service";
import { useUpdateRolePermissionsMutation } from "@/services/team.api";
import { setUser } from "@/store/slices/authSlice";
import { useCallback } from "react";
import { toast } from "react-toastify";

export function useTeamPermissions() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const [updateRolePermissions] = useUpdateRolePermissionsMutation();

  const handleSavePermissions = useCallback(
    async (
      roleId: string,
      perms: string[],
      roleName?: string,
      permNames?: string[],
    ) => {
      // Optimistically update current user's permissions in Redux if their role was edited
      const isCurrentRole =
        currentUser &&
        roleName &&
        currentUser.role?.trim().toLowerCase() ===
          roleName.trim().toLowerCase();

      if (isCurrentRole && permNames) {
        dispatch(
          setUser({
            ...currentUser,
            permissions: permNames,
          }),
        );
      }

      try {
        const result = await updateRolePermissions({
          id: roleId,
          permissions: perms,
        }).unwrap();

        if (result.success) {
          toast.success(result.message || "Permissions updated successfully");
          // Real-time sync: fetch updated profile from server and update Redux without reload
          try {
            const profile = await authService.getProfile();
            dispatch(setUser(profile));
          } catch (e) {
            console.error("Failed to refresh user profile:", e);
          }
        } else {
          toast.error(result.message || "Failed to update permissions");
          // Revert if API returned error
          try {
            const profile = await authService.getProfile();
            dispatch(setUser(profile));
          } catch {}
        }
        return true;
      } catch (err) {
        const error = err as { data?: string };
        console.error("Error updating permissions:", error);
        toast.error(error?.data || "Failed to save permissions");
        // Revert on failure
        try {
          const profile = await authService.getProfile();
          dispatch(setUser(profile));
        } catch {}
        return false;
      }
    },
    [updateRolePermissions, dispatch, currentUser],
  );

  return { handleSavePermissions };
}
