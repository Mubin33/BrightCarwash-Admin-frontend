"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { toast } from "react-toastify";
import { useConnectLeadsToGroupMutation } from "@/services/leads.api";
import axiosInstance from "@/lib/axios-instance";

interface CreateGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedLeads: string[];
    onGroupCreated?: (group: any) => void;
}

export function CreateGroupModal({ isOpen, onClose, selectedLeads, onGroupCreated }: CreateGroupModalProps) {
    const [groupName, setGroupName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [connectLeads] = useConnectLeadsToGroupMutation();

    const handleCreate = async () => {
        if (!groupName.trim()) {
            toast.warning("Enter a group name");
            return;
        }

        setIsSubmitting(true);

        try {
            // Step 1: Create the group
            const createResponse = await axiosInstance.post("/admin/lead-groups", {
                name: groupName.trim(),
            });

            const groupId = createResponse.data.data.id;

            // Step 2: Connect leads if any selected
            if (selectedLeads.length > 0) {
                await connectLeads({
                    groupId: groupId,
                    leadIds: selectedLeads,
                }).unwrap();
                toast.success(`Group "${groupName.trim()}" created with ${selectedLeads.length} leads`);
            } else {
                toast.success(`Empty group "${groupName.trim()}" created`);
            }

            setGroupName("");
            onGroupCreated?.(createResponse.data.data);
            onClose();

        } catch (error: any) {
            toast.error(error?.response?.data?.message || error?.message || "Failed to create group");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="New Group" size="sm">
            <div className="flex flex-col gap-3">
                <div className="w-full h-px bg-[#DFE1E7]" />
                <div>
                    <label className="block text-[#777980] font-inter text-base font-normal leading-[130%] mb-1.5">
                        Group Name
                    </label>
                    <input
                        type="text"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="Enter group name"
                        className="w-full px-4 py-3 border border-[#DFE1E7] rounded-lg bg-white text-[#1B1B1B] placeholder-[#777980] font-inter text-sm outline-none focus:border-[#0098E8]"
                        onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
                    />
                </div>
                {selectedLeads.length > 0 && (
                    <div>
                        <p className="text-xs text-[#777980]">
                            {selectedLeads.length} lead{selectedLeads.length !== 1 ? 's' : ''} will be added to this group
                        </p>
                    </div>
                )}
                {selectedLeads.length === 0 && (
                    <div>
                        <p className="text-xs text-[#FFAF00]">
                            ⚠️ This group will be created empty. You can add leads later.
                        </p>
                    </div>
                )}
                <div className="flex gap-3 justify-end pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="px-6 w-auto!"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreate}
                        isLoading={isSubmitting}
                        loadingText="Creating..."
                        className="px-6 w-auto!"
                        disabled={!groupName.trim()}
                    >
                        Create Group
                    </Button>
                </div>
            </div>
        </Modal>
    );
}