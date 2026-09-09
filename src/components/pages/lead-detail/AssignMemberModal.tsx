"use client";

import { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AssignMemberList } from "./AssignMemberList";
import { useGetTeamMembersQuery } from "@/services/team.api";

interface AssignMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    leadId: string;
    currentAssigneeId?: string | null;
    currentAssigneeName?: string | null;

    onAssign: (memberId: string | null, memberName: string | null) => Promise<void>;
}

export function AssignMemberModal({
    isOpen,
    onClose,
    leadId,
    currentAssigneeId,
    currentAssigneeName,
    onAssign,
}: AssignMemberModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedId, setSelectedId] = useState<string | null>(
        currentAssigneeId || null
    );
    const [selectedName, setSelectedName] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { data: membersData, isLoading } = useGetTeamMembersQuery({ limit: 100 });
    const members = membersData?.members || [];

    useEffect(() => {
        if (isOpen) {
            setSelectedId(currentAssigneeId || null);
            setSelectedName(currentAssigneeName || null);
            setSearchQuery("");
        }
    }, [isOpen, currentAssigneeId, currentAssigneeName]);

    const filteredMembers = members.filter(
        (member) =>
            member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );


    const handleSelectMember = (id: string) => {
        if (selectedId === id) {
            setSelectedId(null);
            setSelectedName(null);
        } else {
            const member = members.find((m) => m.id === id);
            setSelectedId(id);
            setSelectedName(member?.name || null);
        }
    };

    const handleAssign = async () => {
        setIsSubmitting(true);
        try {
            await onAssign(selectedId, selectedName);
            onClose();
        } catch {
            // Error handled in parent
        } finally {
            setIsSubmitting(false);
        }
    };

    const getButtonText = () => {
        if (selectedId === null && currentAssigneeId !== null) {
            return "Remove Assignment";
        }
        if (selectedId === currentAssigneeId) {
            return "Already Assigned";
        }
        return "Assign Team Member";
    };

    const isDisabled =
        selectedId === currentAssigneeId || // No change
        (selectedId === null && currentAssigneeId === null); // Already unassigned

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-30">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl z-10 animate-in slide-in-from-top-4 duration-300">
                <div className="flex flex-col p-6 gap-3">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <h2 className="text-[#1B1B1B] font-inter text-xl font-semibold">
                            Choose the team member
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={20} className="text-[#777980]" />
                        </button>
                    </div>

                    <div className="w-full h-px bg-[#DFE1E7]" />

                    {/* Search input */}
                    <div className="flex p-4 items-center gap-3 rounded-lg border border-[#DFE1E7] bg-[#F8FAFB]">
                        <Search size={18} className="text-[#777980]" />
                        <input
                            type="text"
                            placeholder="Search by member name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 border-none outline-none bg-transparent text-sm text-[#1B1B1B] placeholder-[#777980] font-inter"
                        />
                    </div>

                    <div className="w-full h-px bg-[#DFE1E7]" />

                    {/* Current assignee info */}
                    {currentAssigneeId && currentAssigneeName && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-[#EBF5FF] rounded-lg border border-[#0098E8] text-sm">
                            <span className="text-[#1B1B1B] font-medium">Currently assigned:</span>
                            <span className="text-[#0098E8] font-semibold">{currentAssigneeName}</span>
                        </div>
                    )}

                    {/* Members list */}
                    <div className="max-h-100 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="w-6 h-6 border-2 border-[#0098E8] border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : filteredMembers.length === 0 ? (
                            <p className="text-center text-[#777980] py-8 text-sm">
                                No team members found
                            </p>
                        ) : (
                            <AssignMemberList
                                members={filteredMembers}
                                selectedId={selectedId}
                                onSelect={handleSelectMember}
                            />
                        )}
                    </div>

                    <div className="w-full h-px bg-[#DFE1E7]" />

                    {/* Buttons */}
                    <div className="flex gap-3 justify-end pt-2">
                        <Button variant="outline" onClick={onClose} className="px-6 w-auto!">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAssign}
                            isLoading={isSubmitting}
                            loadingText="Assigning..."
                            disabled={isDisabled}
                            className="px-6 w-auto!"
                        >
                            {getButtonText()}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}