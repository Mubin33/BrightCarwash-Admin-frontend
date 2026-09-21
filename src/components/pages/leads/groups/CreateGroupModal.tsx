"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { toast } from "react-toastify";
import { useConnectLeadsToGroupMutation, useGetLeadsQuery } from "@/services/leads.api";
import axiosInstance from "@/lib/axios-instance";
import { Search, Users, Check, X, Loader2 } from "lucide-react";
import Image from "next/image";
import type { Lead } from "@/types/leads";

interface CreateGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedLeads?: string[];
    onGroupCreated?: (group: any) => void;
}

export function CreateGroupModal({
    isOpen,
    onClose,
    selectedLeads = [],
    onGroupCreated,
}: CreateGroupModalProps) {
    const [groupName, setGroupName] = useState("");
    const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const prevIsOpenRef = useRef(false);

    const [connectLeads] = useConnectLeadsToGroupMutation();

    // Fetch existing leads from the system
    const { data: paginatedLeads, isLoading: isLeadsLoading } = useGetLeadsQuery(
        { page: 1, limit: 100 },
        { skip: !isOpen }
    );

    const allLeads: Lead[] = useMemo(() => paginatedLeads?.data || [], [paginatedLeads]);

    // ONLY initialize / reset state when modal transitions from closed to open
    useEffect(() => {
        if (isOpen && !prevIsOpenRef.current) {
            setSelectedLeadIds(selectedLeads && Array.isArray(selectedLeads) ? [...selectedLeads] : []);
            setGroupName("");
            setSearchQuery("");
        }
        prevIsOpenRef.current = isOpen;
    }, [isOpen]);

    // Filter leads by search query
    const filteredLeads = useMemo(() => {
        if (!searchQuery.trim()) return allLeads;
        const q = searchQuery.toLowerCase().trim();
        return allLeads.filter(
            (lead) =>
                lead.name.toLowerCase().includes(q) ||
                lead.email.toLowerCase().includes(q) ||
                (lead.phone && lead.phone.toLowerCase().includes(q)) ||
                (lead.service && lead.service.toLowerCase().includes(q))
        );
    }, [allLeads, searchQuery]);

    const handleToggleLead = (leadId: string) => {
        setSelectedLeadIds((prev) =>
            prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
        );
    };

    const handleToggleSelectAll = () => {
        const filteredIds = filteredLeads.map((l) => l.id);
        const allFilteredSelected = filteredIds.every((id) => selectedLeadIds.includes(id));

        if (allFilteredSelected) {
            setSelectedLeadIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
        } else {
            const newSelections = Array.from(new Set([...selectedLeadIds, ...filteredIds]));
            setSelectedLeadIds(newSelections);
        }
    };

    const isAllFilteredSelected =
        filteredLeads.length > 0 &&
        filteredLeads.every((lead) => selectedLeadIds.includes(lead.id));

    const handleCreate = async () => {
        if (!groupName.trim()) {
            toast.warning("Please enter a group name");
            return;
        }

        setIsSubmitting(true);

        try {
            // Step 1: Create the group
            const createResponse = await axiosInstance.post("/admin/lead-groups", {
                name: groupName.trim(),
            });

            const createdGroup = createResponse.data.data;
            const groupId = createdGroup?.id;

            // Step 2: Connect selected leads if any
            if (groupId && selectedLeadIds.length > 0) {
                await connectLeads({
                    groupId: groupId,
                    leadIds: selectedLeadIds,
                }).unwrap();
                toast.success(
                    `Group "${groupName.trim()}" created with ${selectedLeadIds.length} lead${selectedLeadIds.length !== 1 ? "s" : ""}`
                );
            } else {
                toast.success(`Empty group "${groupName.trim()}" created`);
            }

            setGroupName("");
            setSelectedLeadIds([]);
            onGroupCreated?.(createdGroup);
            onClose();
        } catch (error: any) {
            const errorMsg =
                error?.response?.data?.message ||
                error?.data?.message ||
                error?.message ||
                "Failed to create group";
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="New Lead Group" size="lg">
            <div className="flex flex-col gap-4">
                {/* Group Name Input */}
                <div>
                    <label className="block text-[#1B1B1B] font-inter text-sm font-medium mb-1.5">
                        Group Name <span className="text-[#FF4345]">*</span>
                    </label>
                    <input
                        type="text"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="e.g. Premium VIP Customers, Fleet Leads"
                        className="w-full px-4 py-2.5 border border-[#DFE1E7] rounded-lg bg-white text-[#1B1B1B] placeholder-[#777980] font-inter text-sm outline-none focus:border-[#0098E8] transition-colors"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleCreate();
                        }}
                        autoFocus
                    />
                </div>

                <div className="w-full h-px bg-[#DFE1E7]" />

                {/* Lead Selection Section */}
                <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users size={16} className="text-[#0098E8]" />
                            <span className="text-[#1B1B1B] font-inter text-sm font-semibold">
                                Select Existing Leads
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#EBF6FD] text-[#0098E8] border border-[#BCE3FA]">
                                {selectedLeadIds.length} selected
                            </span>
                        </div>

                        {filteredLeads.length > 0 && (
                            <button
                                type="button"
                                onClick={handleToggleSelectAll}
                                className="text-xs font-inter text-[#0098E8] hover:text-[#007BB8] font-medium transition-colors cursor-pointer"
                            >
                                {isAllFilteredSelected ? "Deselect All Filtered" : "Select All Filtered"}
                            </button>
                        )}
                    </div>

                    {/* Search Leads Bar */}
                    <div className="relative">
                        <Search
                            size={16}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777980] pointer-events-none"
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search leads by name, email, phone, or service..."
                            className="w-full pl-9 pr-9 py-2 border border-[#DFE1E7] rounded-lg bg-[#F8FAFB] text-[#1B1B1B] placeholder-[#777980] font-inter text-xs sm:text-sm outline-none focus:bg-white focus:border-[#0098E8] transition-colors"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777980] hover:text-[#1B1B1B]"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Leads Scrollable List */}
                    <div className="border border-[#DFE1E7] rounded-xl overflow-hidden bg-white">
                        <div className="max-h-56 overflow-y-auto divide-y divide-[#F0F1F3]">
                            {isLeadsLoading ? (
                                <div className="flex items-center justify-center py-8 gap-2 text-sm text-[#777980]">
                                    <Loader2 size={18} className="animate-spin text-[#0098E8]" />
                                    Loading existing leads...
                                </div>
                            ) : filteredLeads.length === 0 ? (
                                <div className="py-8 text-center text-xs sm:text-sm text-[#777980]">
                                    {allLeads.length === 0
                                        ? "No leads available in the system yet."
                                        : "No leads found matching your search."}
                                </div>
                            ) : (
                                filteredLeads.map((lead) => {
                                    const isSelected = selectedLeadIds.includes(lead.id);
                                    return (
                                        <div
                                            key={lead.id}
                                            onClick={() => handleToggleLead(lead.id)}
                                            className={`flex items-center justify-between px-3.5 py-2.5 cursor-pointer transition-colors ${
                                                isSelected
                                                    ? "bg-[#F0F8FE] hover:bg-[#E7F3FD]"
                                                    : "hover:bg-[#F8FAFB]"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                {/* Checkbox */}
                                                <div
                                                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                                        isSelected
                                                            ? "bg-[#0098E8] border-[#0098E8] text-white"
                                                            : "border-[#DFE1E7] bg-white"
                                                    }`}
                                                >
                                                    {isSelected && <Check size={12} strokeWidth={3} />}
                                                </div>

                                                {/* Avatar / Name / Email */}
                                                <div className="w-7 h-7 rounded-full bg-[#EBF6FD] text-[#0098E8] font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden border border-[#DFE1E7]">
                                                    {lead.avatar && lead.avatar !== "/images/avatar-placeholder.png" ? (
                                                        <Image
                                                            src={lead.avatar}
                                                            alt={lead.name}
                                                            width={28}
                                                            height={28}
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        lead.name.charAt(0).toUpperCase()
                                                    )}
                                                </div>

                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-xs sm:text-sm font-medium text-[#1B1B1B] truncate">
                                                        {lead.name}
                                                    </span>
                                                    <span className="text-xs text-[#777980] truncate">
                                                        {lead.email || lead.phone || "No contact info"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Badges */}
                                            <div className="flex items-center gap-2 shrink-0 ml-2">
                                                {lead.service && (
                                                    <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-[#F4F5F7] text-[#4B4D54] max-w-[120px] truncate">
                                                        {lead.service}
                                                    </span>
                                                )}
                                                {lead.stage && (
                                                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#EBF6FD] text-[#0098E8] capitalize">
                                                        {lead.stage.replace(/_/g, " ")}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Summary Info */}
                <div>
                    {selectedLeadIds.length > 0 ? (
                        <p className="text-xs text-[#0098E8] font-medium">
                            ✓ {selectedLeadIds.length} lead{selectedLeadIds.length !== 1 ? "s" : ""}{" "}
                            will be added to this group on creation.
                        </p>
                    ) : (
                        <p className="text-xs text-[#FFAF00]">
                            ⚠️ No leads selected. This group will be created empty (you can add leads later).
                        </p>
                    )}
                </div>

                {/* Footer Action Buttons */}
                <div className="flex gap-3 justify-end pt-2 border-t border-[#DFE1E7]">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="px-6 w-auto!"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreate}
                        isLoading={isSubmitting}
                        loadingText="Creating..."
                        className="px-6 w-auto! bg-[#0098E8] hover:bg-[#0088D8] text-white"
                        disabled={!groupName.trim() || isSubmitting}
                    >
                        Create Group
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
