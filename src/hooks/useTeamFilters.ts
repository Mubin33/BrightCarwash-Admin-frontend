"use client";

import { useState, useMemo } from "react";
import type { TeamMember } from "@/types/team";

export function useTeamFilters(members: TeamMember[]) {
    const [searchQuery, setSearchQuery] = useState("");

    const filtered = useMemo(() =>
        members.filter((m) => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (
                (m.name || "").toLowerCase().includes(q) ||
                (m.email || "").toLowerCase().includes(q) ||
                (m.username || "").toLowerCase().includes(q) ||
                (m.role || "").toLowerCase().includes(q)
            );
        }),
        [members, searchQuery]);

    return { searchQuery, setSearchQuery, filteredMembers: filtered };
}