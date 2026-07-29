import { ActionsDropdown } from "@/components/ui/ActionsDropdown";
import type { Column } from "@/components/ui/DataTable";
import type { TeamMember, TeamRole } from "@/types/team";
import { PERMISSIONS } from "@/lib/permissions";

function resolveSuperAdminRoleName(roles: TeamRole[]): string | null {
    const match = roles.find((r) => {
        const normalized = r.name.toLowerCase().replace(/[\s_-]/g, "");
        return normalized === "superadmin" || normalized === "superuser";
    });
    return match ? match.name : null;
}

const roleStyles: Record<string, string> = {
    Admin: "bg-[#FFE6E6] text-[#FF4345]",
    Manager: "bg-[#DCF7EA] text-[#006F1F]",
    Staff: "bg-[#FFF7E6] text-[#FFAF00]",
    "View Only": "bg-[#F8FAFB] text-[#777980]",
};

const statusStyles: Record<number, string> = {
    1: "bg-[#DCF7EA] text-[#006F1F]",
    0: "bg-[#FFE6E6] text-[#FF4345]",
};

interface TeamsColumnsParams {
    onEditRole: (member: TeamMember) => void;
    onToggleBlock: (member: TeamMember) => void;
    onResendInvite: (member: TeamMember) => void;
    currentUserId: string;
    currentUserRole: string;
    roles: TeamRole[];
}

export function createTeamsColumns({
    onEditRole,
    onToggleBlock,
    onResendInvite,
    currentUserId,
    currentUserRole,
    roles,
}: TeamsColumnsParams): Column<TeamMember>[] {

    const superAdminRole = resolveSuperAdminRoleName(roles);

    const canEditRole = (): boolean => true;

    const canBlockMember = (member: TeamMember): boolean => {
        const isSelf = String(member.id) === String(currentUserId);
        const targetIsSuperAdmin = !!superAdminRole && member.role === superAdminRole;
        const targetIsAdmin = member.role === "Admin";

        if (isSelf) return false;
        if (targetIsSuperAdmin) return false;
        if (targetIsAdmin) return false;

        return true;
    };

    const canResendInvite = (member: TeamMember): boolean => {
        return true; // Show for everyone
    };

    return [
        {
            key: "name",
            header: "Member",
            render: (row) => (
                <div>
                    <span className="text-[#1B1B1B] font-inter text-sm font-medium block">
                        {row.first_name && row.last_name
                            ? `${row.first_name} ${row.last_name}`
                            : row.name || row.username || "—"}
                    </span>
                    <span className="text-[#777980] font-inter text-xs">{row.email}</span>
                </div>
            ),
        },
        {
            key: "role",
            header: "Role",
            render: (row) => (
                <span className={`inline-flex py-1.5 px-3 justify-center items-center gap-1 rounded-md text-sm font-medium ${roleStyles[row.role] || roleStyles["Staff"]}`}>
                    {row.role}
                </span>
            ),
        },
        {
            key: "status",
            header: "Status",
            render: (row) => (
                <span className={`inline-flex py-1.5 px-3 justify-center items-center gap-1 rounded-md text-sm font-medium ${statusStyles[row.status]}`}>
                    {row.status === 1 ? "Active" : "Blocked"}
                </span>
            ),
        },
        {
            key: "actions",
            header: "",
            className: "w-12",
            render: (row) => {
                const items: { label: string; onClick: () => void; disabled?: boolean; permission?: string }[] = [];

                if (canEditRole()) {
                    items.push({
                        label: "Edit Role",
                        onClick: () => onEditRole(row),
                        permission: PERMISSIONS.member.roles_update,
                    });
                }

                if (canResendInvite(row)) {
                    items.push({
                        label: "Resend Invite",
                        onClick: () => onResendInvite(row),
                        permission: PERMISSIONS.staff.invite,
                    });
                }

                const blockAllowed = canBlockMember(row);
                items.push({
                    label: row.status === 1 ? "Block" : "Unblock",
                    onClick: () => onToggleBlock(row),
                    disabled: !blockAllowed,
                    permission: row.status === 1 ? PERMISSIONS.member.block : PERMISSIONS.member.unblock,
                });

                if (items.length === 0) return null;

                return <ActionsDropdown items={items} />;
            },
        },
    ];
}