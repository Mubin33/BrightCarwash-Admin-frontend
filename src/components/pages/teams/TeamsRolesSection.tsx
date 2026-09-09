"use client";

import { useMemo, useState } from "react";
import { Pencil, Users, Key } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { useLazyGetRoleByIdQuery } from "@/services/team.api";
import type { TeamRole, TeamMember } from "@/types/team";
import { PERMISSIONS } from "@/lib/permissions";

const ITEMS_PER_PAGE = 5;

const roleColors: Record<string, string> = {
    Admin: "#FF4345",
    Manager: "#006F1F",
    Staff: "#FFAF00",
    "View Only": "#777980",
};

function isSuperAdmin(roleName: string): boolean {
    const normalized = roleName.toLowerCase().replace(/[\s_-]/g, "");
    return normalized === "superadmin" || normalized === "superuser";
}

interface TeamsRolesSectionProps {
    roles: TeamRole[];
    members: TeamMember[];
    onEditPermissions: (role: TeamRole) => void;
    onCreateRole: () => void;
    onDeleteRole: (role: TeamRole) => void;
}

export function TeamsRolesSection({
    roles,
    members,
    onEditPermissions,
    onCreateRole,
    onDeleteRole
}: TeamsRolesSectionProps) {
    const [prefetchRole] = useLazyGetRoleByIdQuery();
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.max(1, Math.ceil(roles.length / ITEMS_PER_PAGE));
    const paginatedRoles = useMemo(
        () => roles.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
        [roles, currentPage]
    );

    const roleMemberCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const m of members) {
            counts[m.role] = (counts[m.role] || 0) + 1;
        }
        return counts;
    }, [members]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-end gap-3 self-stretch">
                <h2 className="text-[#0B1220] font-lora text-lg sm:text-xl font-bold leading-[100%]">
                    Roles & Permissions
                </h2>
                <Button
                    permission={PERMISSIONS.role.create}
                    className="flex py-2.5 px-4 items-center gap-2 rounded bg-[#0098E8] text-white font-inter text-sm hover:bg-[#0088D8] transition-colors w-auto!"
                    onClick={onCreateRole}
                >
                    <Icon name="plus" width={14} height={14} /> Create Role
                </Button>
            </div>

            <div className="max-h-79 overflow-y-auto rounded-lg border border-[#E8E8E9]">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-[#F1F1F1] sticky top-0 z-10">
                            <th className="py-2.5 px-4 text-left text-[#777980] font-inter text-xs font-medium uppercase tracking-wider">
                                Role Name
                            </th>
                            <th className="py-2.5 px-4 text-left text-[#777980] font-inter text-xs font-medium uppercase tracking-wider">
                                Members
                            </th>
                            <th className="py-2.5 px-4 text-left text-[#777980] font-inter text-xs font-medium uppercase tracking-wider w-24">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedRoles.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="py-10 text-center text-[#777980] text-sm">
                                    No roles found.
                                </td>
                            </tr>
                        ) : (
                            paginatedRoles.map((role) => {
                                const color = roleColors[role.name] || "#777980";
                                const count = roleMemberCounts[role.name] || 0;
                                const superAdmin = isSuperAdmin(role.name);
                                return (
                                    <tr
                                        key={role.id}
                                        className="border-t border-[#E8E8E9] bg-white hover:bg-[#F8FAFB] transition-colors"
                                    >
                                        <td className="py-2.5 px-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                                    style={{ backgroundColor: color + "1A" }}
                                                >
                                                    <Key size={14} style={{ color }} />
                                                </div>
                                                <span className="text-[#1B1B1B] font-inter text-sm font-medium">
                                                    {role.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-4">
                                            <div className="flex items-center gap-2">
                                                <Users size={14} className="text-[#777980]" />
                                                <span className="text-[#777980] font-inter text-sm">
                                                    {count} {count === 1 ? "member" : "members"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-4">
                                            {!superAdmin && (
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="icon"
                                                        permission={PERMISSIONS.role.update}
                                                        onClick={() => onEditPermissions(role)}
                                                        onMouseEnter={() => prefetchRole(role.name)}
                                                        className="flex p-1.5 items-center rounded text-[#777980] hover:text-[#1B1B1B] hover:bg-gray-100 transition-colors"
                                                    >
                                                        <Pencil size={15} />
                                                    </Button>
                                                    <Button
                                                        variant="icon"
                                                        permission={PERMISSIONS.role.delete}
                                                        onClick={() => onDeleteRole(role)}
                                                        className="flex p-1.5 items-center rounded text-[#777980] hover:text-[#FF4345] hover:bg-[#FFE6E6] transition-colors"
                                                    >
                                                        <Icon name="delete" width={15} height={15} />
                                                    </Button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={roles.length}
                itemsPerPage={ITEMS_PER_PAGE}
            />
        </div>
    );
}