"use client";

import { useState, useMemo, memo } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { createCampaignColumns } from "./CampaignColumns";
import type { Campaign } from "@/types/campaign";

const ITEMS_PER_PAGE = 8;

interface CampaignsTableProps {
    campaigns: Campaign[];
    onEdit: (c: Campaign) => void;
    onDelete: (c: Campaign) => void;
    onLaunch?: (c: Campaign) => void;
    onStatusAction?: (c: Campaign, action: "SUSPEND" | "RESTART") => void;
    deletingId?: string | null;
}

export const CampaignsTable = memo(function CampaignsTable({
    campaigns,
    onEdit,
    onDelete,
    onLaunch,
    onStatusAction,
    deletingId,
}: CampaignsTableProps) {
    const [currentPage, setCurrentPage] = useState(1);


    const safeCampaigns = campaigns || [];
    const totalPages = Math.max(1, Math.ceil(safeCampaigns.length / ITEMS_PER_PAGE));

    const paginated = useMemo(
        () =>
            safeCampaigns.slice(
                (currentPage - 1) * ITEMS_PER_PAGE,
                currentPage * ITEMS_PER_PAGE
            ),
        [safeCampaigns, currentPage]
    );

    const columns = useMemo(
        () =>
            createCampaignColumns({
                onEdit,
                onDelete,
                onLaunch,
                onStatusAction,
            }),
        [onEdit, onDelete, onLaunch, onStatusAction]
    );

    return (
        <div className="flex flex-col gap-4 w-full ">
            <DataTable
                columns={columns}
                data={paginated}
                rowKey={(row) => row.id}
                className="w-full border border-[#E8E8E9] rounded-lg"
            />
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={safeCampaigns.length}
                itemsPerPage={ITEMS_PER_PAGE}
            />
        </div>
    );
});