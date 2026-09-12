"use client";

import { useSelector } from 'react-redux';
import { hasPermission } from '@/lib/permissions';

export function usePermission(permission: string): boolean {
    const user = useSelector((state: { auth: { user: { permissions: string[] } | null } }) => state.auth.user);
    return hasPermission(user, permission);
}