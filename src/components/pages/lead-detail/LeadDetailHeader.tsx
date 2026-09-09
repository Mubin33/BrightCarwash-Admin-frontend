"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Pencil, UserPlus, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PERMISSIONS } from "@/lib/permissions";

interface LeadDetailHeaderProps {
    leadEmail: string;
    onAssignClick: () => void;
    onEditClick: () => void;
}

export function LeadDetailHeader({ leadEmail, onAssignClick, onEditClick }: LeadDetailHeaderProps) {
    const router = useRouter();

    const handleSendEmail = () => {
        const params = new URLSearchParams({ to: leadEmail });
        router.push(`/marketing/email-list/create?${params.toString()}`);
    };

    return (
        <div className="flex flex-col justify-between items-start self-stretch">
            <div>
                <div className="flex items-center gap-2 text-sm text-[#777980] font-inter mb-6">
                    <Link href="/leads" className="hover:text-[#0098E8]">
                        Leads
                    </Link>
                    <ChevronRight size={14} />
                    <span className="text-[#1B1B1B]">Lead Detail</span>
                </div>
            </div>
            <div className="flex justify-between items-center self-stretch">
                <div>
                    <h2 className="text-[#0B1220] font-lora text-xl font-bold leading-[100%]">
                        Lead Details
                    </h2>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <Button
                        onClick={handleSendEmail}
                        permission={PERMISSIONS.mail_management.send_email}
                        className="flex py-2.5 px-4 items-center gap-2 rounded bg-[#0098E8] text-white font-inter text-sm hover:bg-[#0088D8] transition-colors w-auto!"
                    >
                        <Mail size={16} />
                        Send Email
                    </Button>
                    <Button
                        onClick={onAssignClick}
                        permission={PERMISSIONS.lead.assign}
                        variant="outline"
                        className="flex py-2.5 px-4 items-center gap-2 rounded border border-[#DFE1E7] text-[#1B1B1B] font-inter text-sm hover:bg-[#F8FAFB] transition-colors w-auto!"
                    >
                        <UserPlus size={16} />
                        Assign Member
                    </Button>
                    <Button
                        onClick={onEditClick}
                        permission={PERMISSIONS.lead.update}
                        variant="outline"
                        className="flex py-2.5 px-4 items-center gap-2 rounded border border-[#DFE1E7] text-[#1B1B1B] font-inter text-sm hover:bg-[#F8FAFB] transition-colors w-auto!"
                    >
                        <Pencil size={16} />
                        Edit Lead
                    </Button>
                </div>
            </div>
        </div>
    );
}