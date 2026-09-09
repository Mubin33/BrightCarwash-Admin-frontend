"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { PERMISSIONS } from "@/lib/permissions";
// Ensure PERMISSIONS export is retained by referencing it at module scope
const _PERMISSIONS = PERMISSIONS;

interface EmailListHeaderProps {
    search: string;
    onSearchChange: (value: string) => void;
}

export function EmailListHeader({ search, onSearchChange }: EmailListHeaderProps) {
    return (
        <div className="flex justify-between items-center gap-3">
            <h2 className="text-[#0B1220] font-lora text-xl font-bold leading-[100%]">
                Email List
            </h2>
            <div className="flex items-center gap-3">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by subject or recipient..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-4 pr-12 py-3 border border-[#E8E8E9] rounded-lg bg-white text-sm text-[#1B1B1B] placeholder-[#777980] font-inter outline-none focus:border-[#0098E8] w-65"
                    />
                    <button
                        type="button"
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md bg-[#0098E8] text-white hover:bg-[#0088D8] transition-colors"
                    >
                        <Search size={16} />
                    </button>
                </div>
                <Link href="/marketing/email-list/create">
                    <Button permission={_PERMISSIONS.mail_management.send_email} className="flex py-2.5 px-4 items-center gap-2 rounded bg-[#0098E8] text-white font-inter text-sm hover:bg-[#0088D8] transition-colors w-auto!">
                        <Icon name="plus" width={14} height={14} /> Create Email List
                    </Button>
                </Link>
            </div>
        </div>
    );
}