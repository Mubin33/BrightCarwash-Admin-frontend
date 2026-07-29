'use client';

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { createTeamsColumns } from "@/components/pages/teams/TeamsColumns";
import type { TeamMember, TeamRole } from "@/types/team";
import { PERMISSIONS } from "@/lib/permissions";

const ITEMS_PER_PAGE = 5;

interface TeamsMembersSectionProps {
    members: TeamMember[];
    roles: TeamRole[];
    searchQuery: string;
    onSearchChange: (val: string) => void;
    currentPage: number;
    onPageChange: (page: number) => void;
    onEditRole: (member: TeamMember) => void;
    onToggleBlock: (member: TeamMember) => void;
    onResendInvite: (member: TeamMember) => void;
    onAddMember: () => void;
    currentUserId: string;
    currentUserRole: string;
    meta: { totalItems: number; totalPages: number; currentPage: number };
    isFetching: boolean;
}

export function TeamsMembersSection({
    members,
    roles,
    searchQuery,
    onSearchChange,
    currentPage,
    onPageChange,
    onEditRole,
    onToggleBlock,
    onResendInvite,
    onAddMember,
    currentUserId,
    currentUserRole,
    meta,
    isFetching,
}: TeamsMembersSectionProps) {
    const [inputValue, setInputValue] = useState(searchQuery);

    const columns = useMemo(
        () => createTeamsColumns({ onEditRole, onResendInvite, onToggleBlock, currentUserId, currentUserRole, roles }),
        [onEditRole, onToggleBlock, onResendInvite, currentUserId, currentUserRole, roles]
    );

    const handleSearch = () => {
        onSearchChange(inputValue);
        onPageChange(1);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-end gap-3 self-stretch">
                <h2 className="text-[#0B1220] font-lora text-lg sm:text-xl font-bold leading-[100%]">
                    Teams
                </h2>
                <div className="flex items-center gap-3">
                    <div className="relative min-w-[260px]">
                        <input
                            type="text"
                            placeholder="Search members..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            className="w-full pl-4 pr-12 py-3 border border-[#E8E8E9] rounded-lg bg-white text-sm text-[#1B1B1B] placeholder-[#777980] font-inter outline-none focus:border-[#0098E8]"
                        />
                        <button
                            type="button"
                            onClick={handleSearch}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md bg-[#0098E8] text-white hover:bg-[#0088D8] transition-colors"
                        >
                            <Search size={16} />
                        </button>
                    </div>
                    <Button
                        permission={PERMISSIONS.staff.invite}
                        className="flex py-2.5 px-4 items-center gap-2 rounded bg-[#0098E8] text-white font-inter text-sm hover:bg-[#0088D8] transition-colors w-auto!"
                        onClick={onAddMember}
                    >
                        <Icon name="plus" width={14} height={14} /> Add Member
                    </Button>
                </div>
            </div>

            <div className="max-h-79 overflow-y-auto rounded-lg border border-[#E8E8E9] relative">
                {isFetching && (
                    <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-[#0098E8] border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
                <DataTable
                    columns={columns}
                    data={members}
                    rowKey={(row) => row.id}
                    className="border-0 rounded-none"
                />
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={meta.totalPages}
                onPageChange={onPageChange}
                totalItems={meta.totalItems}
                itemsPerPage={ITEMS_PER_PAGE}
                isLoading={isFetching}
            />
        </div>
    );
}