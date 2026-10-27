"use client";

import { EditMemberRoleModal } from "@/components/pages/teams/EditMemberRoleModal";
import { TeamsMembersSection } from "@/components/pages/teams/TeamsMembersSection";
import { TeamsModals } from "@/components/pages/teams/TeamsModals";
import { TeamsRolesSection } from "@/components/pages/teams/TeamsRolesSection";
import { usePermission } from "@/hooks/usePermission";
import { useTeamPermissions } from "@/hooks/useTeamPermissions";
import { PERMISSIONS } from "@/lib/permissions";
import { useAppDispatch, type RootState } from "@/lib/store";
import {
  teamApi,
  useBlockMemberMutation,
  useDeleteRoleMutation,
  useGetPermissionsQuery,
  useGetRoleByIdQuery,
  useGetTeamMembersQuery,
  useGetTeamRolesQuery,
  useResendInviteMutation,
  useRevokedInviteMutation,
  useUnblockMemberMutation,
} from "@/services/team.api";
import type { TeamMember, TeamRole } from "@/types/team";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const ITEMS_PER_PAGE = 5;

export function TeamsContent() {
  const canReadMembers = usePermission(PERMISSIONS.member.read);
  const canReadRoles = usePermission(PERMISSIONS.role.read);
  const canCreateRole = usePermission(PERMISSIONS.role.create);
  const canUpdateRole = usePermission(PERMISSIONS.role.update);
  const canDeleteRole = usePermission(PERMISSIONS.role.delete);
  const canReadPermission = usePermission(PERMISSIONS.permission.read);

  const canEditPermissions = canUpdateRole && canReadPermission;

  const [searchQuery, setSearchQuery] = useState("");
  const [memberPage, setMemberPage] = useState(1);

  const {
    data: membersData,
    isLoading: isMembersLoading,
    error: membersError,
    isFetching,
    refetch: refetchMembers,
  } = useGetTeamMembersQuery(
    {
      search: searchQuery || undefined,
      page: memberPage,
      limit: ITEMS_PER_PAGE,
    },
    { skip: !canReadMembers },
  );
  const dispatch = useAppDispatch();
  const [extraMembers, setExtraMembers] = useState<TeamMember[]>([]);

  // Issue #139 (A-15): Server limit is strictly capped at 100 (sending limit: 1000 causes 400 Bad Request).
  // Request first page with limit: 100 and page through if totalPages > 1.
  const { data: firstPageMembersData } = useGetTeamMembersQuery(
    { page: 1, limit: 100 },
    { skip: !canReadMembers },
  );

  const totalMemberPages = firstPageMembersData?.meta?.totalPages || 1;

  useEffect(() => {
    if (!canReadMembers || totalMemberPages <= 1) {
      setExtraMembers([]);
      return;
    }

    let isMounted = true;
    const runningSubscriptions: Array<{ unsubscribe?: () => void }> = [];

    const fetchRemainingPages = async () => {
      try {
        const promises = [];
        for (let page = 2; page <= totalMemberPages; page++) {
          const sub = dispatch(
            teamApi.endpoints.getTeamMembers.initiate(
              { page, limit: 100 },
              { subscribe: false, forceRefetch: true },
            ),
          );
          runningSubscriptions.push(sub);
          promises.push(sub.unwrap());
        }
        const results = await Promise.all(promises);
        if (!isMounted) return;
        const allFetchedExtra = results.flatMap((res) => res.members);
        setExtraMembers(allFetchedExtra);
      } catch (error) {
        if (isMounted) {
          console.error("Failed to fetch remaining team members:", error);
        }
      }
    };

    fetchRemainingPages();

    return () => {
      isMounted = false;
      runningSubscriptions.forEach((sub) => {
        if (typeof sub?.unsubscribe === "function") {
          sub.unsubscribe();
        }
      });
    };
  }, [totalMemberPages, canReadMembers, dispatch]);

  const allMembers = useMemo(() => {
    const firstPage = firstPageMembersData?.members || [];
    return extraMembers.length > 0 ? [...firstPage, ...extraMembers] : firstPage;
  }, [firstPageMembersData?.members, extraMembers]);
  const members = membersData?.members || [];
  const membersMeta = membersData?.meta || {
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
  };

  const {
    data: roles = [],
    isLoading: isRolesLoading,
    error: rolesError,
    refetch: refetchRoles,
  } = useGetTeamRolesQuery(undefined, { skip: !canReadRoles });
  const { data: permissions = [] } = useGetPermissionsQuery(undefined, {
    skip: !canReadRoles || !canReadPermission,
  });
  const [blockMember] = useBlockMemberMutation();
  const [unblockMember] = useUnblockMemberMutation();
  const [resendInvite] = useResendInviteMutation();
  const [revokedInvite] = useRevokedInviteMutation();
  const [editRole, setEditRole] = useState<TeamRole | null>(null);
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const rolePermissionsRef = useRef<string[]>([]);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [createRoleOpen, setCreateRoleOpen] = useState(false);
  const [editMemberRoleTarget, setEditMemberRoleTarget] =
    useState<TeamMember | null>(null);
  const [deleteRole] = useDeleteRoleMutation();

  const handleDeleteRole = async (role: TeamRole) => {
    if (!canDeleteRole) return;
    if (!confirm(`Delete role "${role.name}"?`)) return;
    try {
      await deleteRole(role.id).unwrap();
      toast.success(`Role "${role.name}" deleted`);
    } catch {
      toast.error("Failed to delete role");
    }
  };
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const { data: rolePerms = [] } = useGetRoleByIdQuery(editRole?.name || "", {
    skip: !editRole || !canEditPermissions,
  });
  const { handleSavePermissions } = useTeamPermissions();

  useEffect(() => {
    if (rolePerms.length > 0) {
      const current = rolePermissionsRef.current;
      if (
        current.length !== rolePerms.length ||
        !current.every((id) => rolePerms.includes(id))
      ) {
        setRolePermissions(rolePerms);
        rolePermissionsRef.current = rolePerms;
      }
    } else {
      if (rolePermissionsRef.current.length > 0) {
        setRolePermissions([]);
        rolePermissionsRef.current = [];
      }
    }
  }, [rolePerms]);

  const handleEditRole = (member: TeamMember) => {
    setEditMemberRoleTarget(member);
  };

  const handleResendInvite = async (member: TeamMember) => {
    try {
      await resendInvite(member.email).unwrap();
      toast.success(`Invitation resent to ${member.email}`);
    } catch {
      toast.error("Failed to resend invite");
    }
  };

  const handleRevokedInvite = async (member: TeamMember) => {
    try {
      await revokedInvite(member?.id).unwrap();
      const memberName =
        member?.first_name && member?.last_name
          ? `${member.first_name} ${member.last_name}`
          : member?.name || member?.username || member?.email || "member";
      toast.success(`Invite revoked for ${memberName}`);
    } catch {
      toast.error("Failed to revoke invite");
    }
  };

  const handleToggleBlock = async (member: TeamMember) => {
    try {
      const isMemberActive = member.status === 1 ? true : false;

      if (isMemberActive) {
        await blockMember(member.id).unwrap();
        toast.success(`${member.email} blocked`);
      } else {
        await unblockMember(member.id).unwrap();
        toast.success(`${member.email} unblocked`);
      }
    } catch {
      toast.error("Action failed");
    }
  };
  const isPageLoading =
    (canReadMembers && isMembersLoading) || (canReadRoles && isRolesLoading);

  if (isPageLoading)
    return <div className="h-75 bg-gray-100 rounded-lg animate-pulse w-full" />;

  if (canReadMembers && membersError && (!canReadRoles || rolesError))
    return (
      <div className="flex items-center justify-center py-12 text-[#FF4345] font-inter">
        Failed to load team data.
      </div>
    );

  return (
    <div className="flex flex-col gap-6 w-full">
      {canReadMembers ? (
        membersError ? (
          <div className="flex items-center justify-center py-12 text-[#FF4345] font-inter">
            Failed to load team members.
          </div>
        ) : (
          <TeamsMembersSection
            members={members}
            roles={roles}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            currentPage={memberPage}
            onPageChange={setMemberPage}
            onEditRole={handleEditRole}
            onResendInvite={handleResendInvite}
            onRevokedInvite={handleRevokedInvite}
            onToggleBlock={handleToggleBlock}
            onAddMember={() => setAddMemberOpen(true)}
            currentUserId={currentUser?.id || ""}
            currentUserRole={currentUser?.role || ""}
            meta={membersMeta}
            isFetching={isFetching}
          />
        )
      ) : null}

      {canReadRoles ? (
        rolesError ? (
          <div className="flex items-center justify-center py-12 text-[#FF4345] font-inter">
            Failed to load roles.
          </div>
        ) : (
          <TeamsRolesSection
            roles={roles}
            members={allMembers}
            onEditPermissions={(role) => {
              if (!canEditPermissions) return;
              setEditRole(role);
            }}
            onCreateRole={() => {
              if (!canCreateRole) return;
              setCreateRoleOpen(true);
            }}
            onDeleteRole={handleDeleteRole}
          />
        )
      ) : null}

      {!canReadMembers && !canReadRoles && (
        <div className="flex items-center justify-center py-12 text-[#777980] font-inter">
          You do not have permission to view team members or roles.
        </div>
      )}

      <TeamsModals
        addMemberOpen={addMemberOpen}
        onAddMemberClose={() => setAddMemberOpen(false)}
        createRoleOpen={createRoleOpen}
        onCreateRoleClose={() => setCreateRoleOpen(false)}
        editRole={editRole}
        onEditRoleClose={() => setEditRole(null)}
        roles={roles}
        permissions={permissions}
        rolePermissions={rolePermissions}
        onMemberAdded={() => refetchMembers()}
        onRoleCreated={() => refetchRoles()}
        onSavePermissions={handleSavePermissions}
      />

      <EditMemberRoleModal
        key={editMemberRoleTarget?.id}
        isOpen={!!editMemberRoleTarget}
        onClose={() => setEditMemberRoleTarget(null)}
        member={editMemberRoleTarget}
        roles={roles}
      />
    </div>
  );
}
