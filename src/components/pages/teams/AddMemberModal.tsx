"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FilterDropdown } from "@/components/ui/FilterDropdown";
import type { TeamRole } from "@/types/team";
import { toast } from "react-toastify";
import { getAccessToken } from "@/lib/auth-client";
import { APP_CONFIG } from "@/configs/app.config";

interface AddMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    roles: TeamRole[];
    onMemberAdded: () => void;
}

export function AddMemberModal({ isOpen, onClose, roles, onMemberAdded }: AddMemberModalProps) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [roleName, setRoleName] = useState(roles[0]?.name || "");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const roleOptions = roles.map((r) => ({ value: r.name, label: r.name }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firstName || !lastName || !email) {
            toast.warning("Please fill all required fields");
            return;
        }
        setIsSubmitting(true);
        try {
            if (APP_CONFIG.MOCK_MODE) {
                await new Promise((r) => setTimeout(r, 400));
                toast.success(`Invitation sent to ${email}`);
            } else {
                const token = getAccessToken();
                const res = await fetch(`${APP_CONFIG.API_BASE_URL}/auth/invite-staff`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ firstName, lastName, email, role: roleName }),
                });
                if (!res.ok) throw new Error("Failed to invite");
                toast.success(`Invitation sent to ${email}`);
            }
            setFirstName("");
            setLastName("");
            setEmail("");
            setRoleName(roles[0]?.name || "");
            onClose();
            onMemberAdded();
        } catch {
            toast.error("Failed to add member");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Member" size="md">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="w-full h-px bg-[#DFE1E7]" />
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">First Name *</label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            placeholder="First name"
                            className="w-full px-4 py-2.5 border border-[#DFE1E7] rounded-lg bg-white text-[#1B1B1B] placeholder-[#777980] font-inter text-sm outline-none focus:border-[#0098E8] focus:ring-2 focus:ring-[#0098E8]/10 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">Last Name *</label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            placeholder="Last name"
                            className="w-full px-4 py-2.5 border border-[#DFE1E7] rounded-lg bg-white text-[#1B1B1B] placeholder-[#777980] font-inter text-sm outline-none focus:border-[#0098E8] focus:ring-2 focus:ring-[#0098E8]/10 transition-all"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">Email *</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="email@example.com"
                        className="w-full px-4 py-2.5 border border-[#DFE1E7] rounded-lg bg-white text-[#1B1B1B] placeholder-[#777980] font-inter text-sm outline-none focus:border-[#0098E8] focus:ring-2 focus:ring-[#0098E8]/10 transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">Role</label>
                    <FilterDropdown
                        label="Select role"
                        options={roleOptions}
                        value={roleName}
                        onChange={(val: string) => setRoleName(val)}
                        fullWidth
                        scrollable={roleOptions.length > 5}
                        maxHeight={200}
                    />
                </div>
                <div className="flex gap-3 justify-end pt-2 border-t border-[#E8E8E9]">
                    <Button type="button" variant="outline" onClick={onClose} className="px-6 w-auto!">Cancel</Button>
                    <Button type="submit" isLoading={isSubmitting} loadingText="Adding…" className="px-6 w-auto!">Invite</Button>
                </div>
            </form>
        </Modal>
    );
}