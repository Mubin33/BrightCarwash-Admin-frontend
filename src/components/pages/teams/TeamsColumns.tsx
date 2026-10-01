import { ActionsDropdown } from "@/components/ui/ActionsDropdown";
import type { Column } from "@/components/ui/DataTable";
import { PERMISSIONS } from "@/lib/permissions";
import type { TeamMember, TeamRole } from "@/types/team";
import { TeamsActionConfirm, type TeamsActionType } from "./TeamsActionConfirm";

export { TeamsActionConfirm };
export type { TeamsActionType };

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
  0: "bg-[#DCF7EA] text-[#006F1F]",
  1: "bg-[#FFE6E6] text-[#FF4345]",
  2: "bg-[#FFF7E6] text-[#FFAF00]",
};

interface TeamsColumnsParams {
  onEditRole: (member: TeamMember) => void;
  onToggleBlock: (member: TeamMember) => void;
  onResendInvite: (member: TeamMember) => void;
  onRevokedInvite: (member: TeamMember) => void;
  currentUserId: string;
  currentUserRole: string;
  roles: TeamRole[];
  onActionConfirm?: (action: TeamsActionType, member: TeamMember) => void;
}

export function createTeamsColumns({
  onEditRole,
  onToggleBlock,
  onResendInvite,
  onRevokedInvite,
  currentUserId,
  currentUserRole: _currentUserRole,
  roles,
  onActionConfirm,
}: TeamsColumnsParams): Column<TeamMember>[] {
  void _currentUserRole;

  const superAdminRole = resolveSuperAdminRoleName(roles);

  const canEditRole = (): boolean => true;

  const canBlockMember = (member: TeamMember): boolean => {
    const isSelf = String(member.id) === String(currentUserId);
    const targetIsSuperAdmin =
      !!superAdminRole && member.role === superAdminRole;
    const targetIsAdmin = member.role === "Admin";

    if (isSelf) return false;
    if (targetIsSuperAdmin) return false;
    if (targetIsAdmin) return false;

    return true;
  };

  const canResendInvite = (_member: TeamMember): boolean => {
    void _member;
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
        <span
          className={`inline-flex py-1.5 px-3 justify-center items-center gap-1 rounded-md text-sm font-medium ${roleStyles[row.role] || roleStyles["Staff"]}`}
        >
          {row.role}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => {
        const isActive =
          typeof row.isActive === "boolean"
            ? row.isActive
            : typeof row.is_active === "boolean"
              ? row.is_active
              : row.status === 1;

        return (
          <span
            className={`inline-flex py-1.5 px-3 justify-center items-center gap-1 rounded-md text-sm font-medium ${
              isActive
                ? row.status === 1
                  ? statusStyles[0]
                  : statusStyles[1]
                : statusStyles[2]
            }`}
          >
            {isActive ? (row.status === 1 ? "Active" : "Block") : "Invited"}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "",
      className: "w-12",

      render: (row) => {
        const items: {
          label: string;
          onClick: () => void;
          disabled?: boolean;
          permission?: string;
        }[] = [];

        const isMemberActive =
          typeof row.isActive === "boolean"
            ? row.isActive
            : typeof row.is_active === "boolean"
              ? row.is_active
              : row.status === 1;

        // Edit Role
        if (canEditRole()) {
          items.push({
            label: "Edit Role",
            onClick: () => onEditRole(row),
            permission: PERMISSIONS.member.roles_update,
          });
        }

        // Inactive member actions
        if (!isMemberActive) {
          // Resend Invite
          if (canResendInvite(row)) {
            items.push({
              label: "Resend Invite",
              onClick: () => onResendInvite(row),
              permission: PERMISSIONS.staff.invite,
            });
          }

          // Revoked Invite
          items.push({
            label: "Revoked Invite",
            onClick: () => {
              if (onActionConfirm) {
                onActionConfirm("revoke", row);
              } else {
                onRevokedInvite(row);
              }
            },
            permission: PERMISSIONS.staff.invite,
          });
        }

        // Active member action
        if (isMemberActive) {
          const blockAllowed = canBlockMember(row);

          items.push({
            label: row.status === 1 ? "Block" : "Unblock",
            onClick: () => {
              const action: TeamsActionType =
                row.status === 1 ? "block" : "unblock";
              if (onActionConfirm) {
                onActionConfirm(action, row);
              } else {
                onToggleBlock(row);
              }
            },
            disabled: !blockAllowed,
            permission:
              row.status === 1
                ? PERMISSIONS.member.block
                : PERMISSIONS.member.unblock,
          });
        }

        if (items.length === 0) return null;

        return <ActionsDropdown items={items} />;
      },
    },
  ];
}
