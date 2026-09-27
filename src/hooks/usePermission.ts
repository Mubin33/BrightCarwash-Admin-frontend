"use client";

import { hasPermission } from "@/lib/permissions";
import { useSelector } from "react-redux";

export function usePermission(permission: string | string[]): boolean {
  const user = useSelector(
    (state: { auth: { user: { permissions?: string[] } | null } }) =>
      state.auth.user,
  );
  return hasPermission(user, permission);
}
