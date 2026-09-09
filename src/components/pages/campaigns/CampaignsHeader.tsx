"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { PERMISSIONS } from "@/lib/permissions";

export function CampaignsHeader() {
    return (
        <div className="flex justify-between items-center gap-3">
            <h2 className="text-[#0B1220] font-lora text-xl font-bold leading-[100%]">
                E-mail Campaigns
            </h2>
            <Link href="/campaigns/create">
                <Button
                    permission={PERMISSIONS.campaign.create}
                    className="flex py-2.5 px-4 items-center gap-2 rounded bg-[#0098E8] text-white font-inter text-sm hover:bg-[#0088D8] transition-colors w-auto!"
                >
                    <Icon name="plus" width={14} height={14} /> Create Campaign
                </Button>
            </Link>
        </div>
    );
}