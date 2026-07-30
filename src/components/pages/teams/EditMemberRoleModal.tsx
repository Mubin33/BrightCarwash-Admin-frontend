"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FilterDropdown } from "@/components/ui/FilterDropdown";
import type { TeamMember, TeamRole } from "@/types/team";
import { toast } from "react-toastify";
import { useUpdateMemberRoleMutation } from "@/services/team.api";

interface EditMemberRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    member: TeamMember | null;
    roles: TeamRole[];
}

export function EditMemberRoleModal({ isOpen, onClose, member, roles }: EditMemberRoleModalProps) {
    const [selectedRole, setSelectedRole] = useState(member?.role || "");
    const [updateMemberRole, { isLoading }] = useUpdateMemberRoleMutation();

    const handleSave = async () => {
        if (!member || !selectedRole) return;
        try {
            await updateMemberRole({ id: member.id, roleNames: [selectedRole] }).unwrap();
            toast.success(`Role updated to ${selectedRole}`);
            onClose();
        } catch {
            toast.error("Failed to update role");
        }
    };

    const roleOptions = roles.map((r) => ({ value: r.name, label: r.name }));

    useEffect(() => {
        console.log('🔍 EditMemberRoleModal - roles received:', roles);
        console.log('🔍 EditMemberRoleModal - roleOptions:', roleOptions);
    }, [roles]);
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit Role — ${member?.name || member?.email || ""}`} size="sm">
            <div className="flex flex-col gap-4">
                <div className="w-full h-px bg-[#DFE1E7]" />
                <div>
                    <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">Role</label>
                    <FilterDropdown
                        label="Select role"
                        options={roleOptions}
                        value={selectedRole}
                        onChange={(val: string) => setSelectedRole(val)}
                        fullWidth
                        scrollable={roleOptions.length > 5} // ✅ Enable scroll after 5 items
                        maxHeight={200} // ✅ Limit height
                    />
                </div>
                <div className="flex gap-3 justify-end pt-2 border-t border-[#E8E8E9]">
                    <Button type="button" variant="outline" onClick={onClose} className="px-6 w-auto!">Cancel</Button>
                    <Button onClick={handleSave} isLoading={isLoading} loadingText="Saving…" className="px-6 w-auto!">Save</Button>
                </div>
            </div>
        </Modal>
    );
}