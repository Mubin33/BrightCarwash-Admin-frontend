"use client";

import { useState } from "react";
import { GroupsContent } from "@/components/pages/leads/groups/GroupsContent";

export default function GroupsPage() {
    const [groupModalOpen, setGroupModalOpen] = useState(false);

    return (
        <GroupsContent
            groupModalOpen={groupModalOpen}
            onGroupModalClose={() => setGroupModalOpen(false)}
        />
    );
}