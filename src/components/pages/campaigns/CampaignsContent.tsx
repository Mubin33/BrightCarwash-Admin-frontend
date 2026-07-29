'use client';

import { useRouter } from "next/navigation";
import { useGetCampaignsQuery } from "@/services/campaign.api";
import { useCampaignFilters } from "@/hooks/useCampaignFilters";
import { useCampaignActions } from "@/hooks/useCampaignActions";
import { CampaignsHeader } from "./CampaignsHeader";
import { CampaignsFilters } from "./CampaignsFilters";
import { CampaignsTable } from "./CampaignsTable";
import CampaignsSkeleton from "./CampaignSkeleton";

export function CampaignsContent() {
	const router = useRouter();
	const query = useGetCampaignsQuery();
	const { data: campaigns = [], isLoading, error } = query;
	const filters = useCampaignFilters(campaigns);
	const actions = useCampaignActions();

	const handleEdit = (campaign: any) => {
		// For draft campaigns, navigate to create with edit=true and campaign ID
		if (campaign.status === "DRAFT") {
			router.push(`/campaigns/create?edit=true&id=${campaign.id}`);
			return;
		}

		// For other campaigns, use the existing flow
		const params = new URLSearchParams({
			id: campaign.id,
			name: campaign.name,
			tags: JSON.stringify(campaign.tags || []),
			subject: campaign.emailConfig?.subject || "",
			senderName: campaign.emailConfig?.senderName || "",
			senderEmail: campaign.emailConfig?.senderEmail || "",
			leadGroupId: campaign.emailConfig?.leadGroup?.id || "",
			leadGroupName: campaign.emailConfig?.leadGroup?.name || "",
			scheduledAt: campaign.scheduledAt || "",
			status: campaign.status || "DRAFT",
			templateId: campaign.templateId || "",
		});
		router.push(`/campaigns/create?edit=true&${params.toString()}`);
	};

	if (isLoading) {
		return <CampaignsSkeleton />;
	}

	if (error) {
		return (
			<div className="flex items-center justify-center py-12 text-[#FF4345] font-inter">
				Failed to load campaigns.
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6 w-full">
			<CampaignsHeader />
			<CampaignsFilters
				searchQuery={filters.searchQuery}
				onSearchChange={filters.setSearchQuery}
				typeFilter={filters.typeFilter}
				onTypeChange={filters.setTypeFilter}
				statusFilter={filters.statusFilter}
				onStatusChange={filters.setStatusFilter}
			/>
			<CampaignsTable
				campaigns={filters.filtered}
				onEdit={handleEdit}
				onDelete={actions.handleDelete}
				onLaunch={actions.handleLaunch}
				onStatusAction={actions.handleStatusAction}
				deletingId={actions.deletingId}
			/>
		</div>
	);
}