"use client";

import Image from "next/image";
import type { TeamMember } from "@/types/team";

const roleStyles: Record<string, string> = {
    Admin: "bg-[#FFE6E6] text-[#FF4345]",
    Manager: "bg-[#DCF7EA] text-[#006F1F]",
    Staff: "bg-[#FFF7E6] text-[#FFAF00]",
    "View Only": "bg-[#F8FAFB] text-[#777980]",
};

interface AssignMemberItemProps {
    member: TeamMember;
    isSelected: boolean;
    onSelect: () => void;
}

export function AssignMemberItem({
    member,
    isSelected,
    onSelect,
}: AssignMemberItemProps) {
    return (
        <label
            className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${isSelected
                    ? "bg-[#EBF5FF] border-2 border-[#0098E8]"
                    : "border-2 border-transparent hover:bg-[#F8FAFB]"
                }`}
        >
            <input
                type="checkbox"
                checked={isSelected}
                onChange={onSelect}
                className="w-4 h-4 rounded accent-[#0098E8] cursor-pointer"
            />
            <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white shrink-0">
                    <Image
                        src={member?.avatar || "/images/avatar-placeholder1.png"}
                        alt={member?.name || member?.email}
                        width={32}
                        height={32}
                        className="object-cover"
                    />
                </div>
                <div className="flex justify-between items-center flex-1">
                    <span className="text-[#1B1B1B] font-inter text-sm font-medium">
                        {member?.name || member?.email}
                    </span>
                    <span
                        className={`inline-flex py-1 px-2 rounded-md text-xs font-medium ${roleStyles[member?.role] || roleStyles.Staff}`}
                    >
                        {member?.role}
                    </span>
                </div>
            </div>
        </label>
    );
}