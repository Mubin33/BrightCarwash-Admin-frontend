"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

interface Group {
    id: string;
    name: string;
    leadIds: string[];
}

interface GroupDropdownProps {
    onSelect: (group: Group | null) => void;
}

export function GroupDropdown({ onSelect }: GroupDropdownProps) {
    const [open, setOpen] = useState(false);
    const [groups, setGroups] = useState<Group[]>([]);
    const [selected, setSelected] = useState<Group | null>(null);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("leadGroups") || "[]");
        setGroups(stored);
    }, []);

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex px-4 py-3 items-center gap-2 rounded-lg border border-[#E8E8E9] bg-white text-sm font-inter cursor-pointer hover:bg-[#F8FAFB] transition-colors min-w-[200px]"
            >
                {selected ? (
                    <div className="flex items-center gap-2">
                        <Users size={16} className="text-[#0098E8]" />
                        <span className="text-[#1B1B1B]">{selected.name}</span>
                        <span className="text-[#777980] text-xs bg-[#F1F1F1] px-2 py-0.5 rounded-full">{selected.leadIds.length}</span>
                    </div>
                ) : (
                    <span className="text-[#777980]">Select group</span>
                )}
                <ChevronDown size={16} className={`text-[#777980] ml-auto transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-lg border border-[#E8E8E9] shadow-lg z-20 overflow-hidden">
                    {groups.map((g) => (
                        <button
                            key={g.id}
                            onClick={() => { setSelected(g); onSelect(g); setOpen(false); }}
                            className={`flex w-full py-2.5 px-4 items-center gap-3 text-sm cursor-pointer transition-colors ${selected?.id === g.id ? "bg-[#0098E8] text-white" : "text-[#1B1B1B] hover:bg-[#F8FAFB]"
                                }`}
                        >
                            <Icon name="leads" width={16} height={16} color={selected?.id === g.id ? "#FFF" : "#0098E8"} />
                            <span className="flex-1 text-left">{g.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${selected?.id === g.id ? "bg-white/20 text-white" : "bg-[#F1F1F1] text-[#777980]"}`}>
                                {g.leadIds.length}
                            </span>
                        </button>
                    ))}
                    {groups.length === 0 && (
                        <div className="py-4 text-center text-[#777980] text-sm">No groups yet</div>
                    )}
                </div>
            )}
        </div>
    );
}