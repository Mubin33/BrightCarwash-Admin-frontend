"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { toast } from "react-toastify";
import { getAccessToken } from "@/lib/auth-client";
import { APP_CONFIG } from "@/configs/app.config";

interface CreateRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRoleCreated: () => void;
}

export function CreateRoleModal({ isOpen, onClose, onRoleCreated }: CreateRoleModalProps) {
    const [roleName, setRoleName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roleName.trim()) { toast.warning("Role name is required"); return; }
        const validNameRegex = /^[a-zA-Z\s-]+$/;
        if (!validNameRegex.test(roleName.trim())) {
            toast.warning("Role name can only contain letters, spaces, and hyphens");
            return;
        }
        setIsSubmitting(true);
        try {
            if (APP_CONFIG.MOCK_MODE) {
                await new Promise((r) => setTimeout(r, 400));
                toast.success(`Role "${roleName}" created`);
            } else {
                const token = getAccessToken();
                const res = await fetch(`${APP_CONFIG.API_BASE_URL}/admin/role`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ name: roleName }),
                });
                if (!res.ok) throw new Error("Failed to create role");
                toast.success(`Role "${roleName}" created`);
            }
            setRoleName("");
            onClose();
            onRoleCreated();
        } catch {
            toast.error("Failed to create role");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create Role" size="sm">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="w-full h-px bg-[#DFE1E7]" />
                <div>
                    <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">Role Name *</label>
                    <input type="text" value={roleName} onChange={(e) => setRoleName(e.target.value)} required placeholder="e.g. Marketing"
                        className="w-full px-4 py-2.5 border border-[#DFE1E7] rounded-lg bg-white text-[#1B1B1B] placeholder-[#777980] font-inter text-sm outline-none focus:border-[#0098E8] focus:ring-2 focus:ring-[#0098E8]/10 transition-all" />
                </div>
                <div className="flex gap-3 justify-end pt-2 border-t border-[#E8E8E9]">
                    <Button type="button" variant="outline" onClick={onClose} className="px-6 w-auto!">Cancel</Button>
                    <Button type="submit" isLoading={isSubmitting} loadingText="Creating…" className="px-6 w-auto!">Create</Button>
                </div>
            </form>
        </Modal>
    );
}