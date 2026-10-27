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
      // Snapshot previous user before any optimistic update to guarantee synchronous rollback on failure
      const previousUser = currentUser;

      // Optimistically update current user's permissions in Redux if their role was edited
      const isCurrentRole =
        currentUser &&
        ((roleId &&
          (currentUser.roleId === roleId ||
            currentUser.roleIds?.includes(roleId))) ||
          (roleName &&
            (currentUser.role?.trim().toLowerCase() ===
              roleName.trim().toLowerCase() ||
              currentUser.roles?.some(
                (r) => r.trim().toLowerCase() === roleName.trim().toLowerCase(),
              ))));

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
          roleName,
        }).unwrap();

        if (result.success !== false) {
          toast.success(result.message || "Permissions updated successfully");
          // Real-time sync: fetch updated profile from server and update Redux without reload
          try {
            const profile = await authService.getProfile();
            dispatch(setUser(profile));
          } catch (e) {
            console.error("Failed to refresh user profile from server:", e);
          }

          // Broadcast update across browser tabs AFTER server confirms the mutation (Audit Issue BUG-014)
          if (typeof window !== "undefined" && "BroadcastChannel" in window) {
            try {
              const channel = new BroadcastChannel("auth_permissions_sync");
              channel.postMessage({
                type: "ROLE_PERMISSIONS_UPDATED",
                roleId,
                roleName,
              });
              channel.close();
            } catch (e) {
              console.warn("Failed to broadcast permission sync:", e);
            }
          }
        } else {
          toast.error(result.message || "Failed to update permissions");
          // Revert immediately using local snapshot if API returned error
          if (isCurrentRole && previousUser) {
            dispatch(setUser(previousUser));
          }
          try {
            const profile = await authService.getProfile();
            dispatch(setUser(profile));
          } catch (e) {
            console.error("Failed to re-sync user profile after rejected permission update:", e);
          }
        }
        return true;
      } catch (err) {
        const error = err as { data?: string };
        console.error("Error updating permissions:", error);
        toast.error(error?.data || "Failed to save permissions");
        // Revert immediately using local snapshot to guarantee rollback even if offline
        if (isCurrentRole && previousUser) {
          dispatch(setUser(previousUser));
        }
        try {
          const profile = await authService.getProfile();
          dispatch(setUser(profile));
        } catch (e) {
          console.error("Failed to re-sync user profile after permission update failure:", e);
        }
        return false;
      }
    },
    [updateRolePermissions, dispatch, currentUser],
  );

  return { handleSavePermissions };
}
