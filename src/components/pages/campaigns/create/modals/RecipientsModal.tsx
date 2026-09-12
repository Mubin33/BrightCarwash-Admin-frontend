"use client";

import { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useGetLeadGroupsQuery } from "@/services/leads.api";
import type { LeadGroup } from "@/types/campaign";

interface RecipientsModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedGroupId?: string | null;
    onSave: (groupId: string, groupName: string) => void;
}

export function RecipientsModal({
    isOpen,
    onClose,
    selectedGroupId,
    onSave,
}: RecipientsModalProps) {
    const [selectedGroup, setSelectedGroup] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState("");

    const { data: groups = [], isLoading, refetch } = useGetLeadGroupsQuery({
        search: searchTerm || undefined,
        limit: 50,
    });

    useEffect(() => {
        if (isOpen) {
            refetch();
            if (selectedGroupId) {
                setSelectedGroup(selectedGroupId);
            } else {
                setSelectedGroup("");
            }
            setSearchTerm("");
        }
    }, [isOpen, selectedGroupId, refetch]);

    const filteredGroups = useMemo(() => {
        if (!searchTerm.trim()) return groups;
        const term = searchTerm.toLowerCase();
        return groups.filter(
            (g: LeadGroup) =>
                g.name.toLowerCase().includes(term) ||
                (g.description?.toLowerCase().includes(term) ?? false)
        );
    }, [groups, searchTerm]);

    const selectedGroupName = groups.find((g: LeadGroup) => g.id === selectedGroup)?.name || "";

    const handleSave = () => {
        if (selectedGroup) {
            const name = groups.find((g: LeadGroup) => g.id === selectedGroup)?.name || "";
            onSave(selectedGroup, name);
            onClose();
        }
    };

    const modalTitle = (
        <div className="flex flex-col gap-1">
            <span className="text-[#1D1F2C] font-inter text-2xl font-medium leading-[100%]">
                Recipients
            </span>
            <span className="text-[#777980] font-inter text-sm font-normal leading-[132%]">
                The people who receive your campaign.
            </span>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={modalTitle}
            size="md"
            bodyClassName="py-3!"
        >
            <div className="flex flex-col gap-4">
                <div className="w-full h-px bg-[#DFE1E7]" />

                <div>
                    <label className="block text-[#777980] font-inter text-sm font-normal leading-[130%] mb-1.5">
                        Search Groups
                    </label>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search lead groups..."
                        className="w-full px-4 py-3 border border-[#DFE1E7] rounded-lg bg-white text-[#1B1B1B] placeholder-[#777980] font-inter text-sm outline-none focus:border-[#0098E8] focus:ring-2 focus:ring-[#0098E8]/10 transition-all"
                    />
                </div>

                <div>
                    <label className="block text-[#777980] font-inter text-base font-normal leading-[130%] mb-1.5">
                        Lead Groups
                    </label>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="w-6 h-6 border-2 border-[#0098E8] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filteredGroups.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-[#777980] font-inter text-sm">
                            {searchTerm ? "No groups match your search" : "No lead groups available"}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                            {filteredGroups.map((group: LeadGroup) => (
                                <button
                                    key={group.id}
                                    type="button"
                                    onClick={() => setSelectedGroup(group.id)}
                                    className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${selectedGroup === group.id
                                            ? 'border-[#0098E8] bg-[#EBF5FF]'
                                            : 'border-[#DFE1E7] bg-white hover:border-[#0098E8]'
                                        }`}
                                >
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[#1B1B1B] font-inter text-sm font-medium">
                                            {group.name}
                                        </span>
                                        <span className="text-[#777980] font-inter text-xs">
                                            {group._count?.leads || 0} leads
                                        </span>
                                    </div>
                                    {selectedGroup === group.id && (
                                        <span className="text-[#0098E8] font-inter text-xs font-medium">Selected</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-3 justify-end pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="px-6 w-auto!"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!selectedGroup}
                        className="px-6 w-auto! disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Save
                    </Button>
                </div>
            </div>
        </Modal>
    );
}