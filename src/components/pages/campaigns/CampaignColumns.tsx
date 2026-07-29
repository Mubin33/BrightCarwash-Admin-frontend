import { ActionsDropdown } from "@/components/ui/ActionsDropdown";
import type { Column } from "@/components/ui/DataTable";
import { PERMISSIONS } from "@/lib/permissions";
import type { Campaign } from "@/types/campaign";

const STATUS_STYLES: Record<string, string> = {
	ACTIVE: "bg-[#DCF7EA] text-[#006F1F]",
	COMPLETED: "bg-[#EBF5FF] text-[#0098E8]",
	DRAFT: "bg-[#F8FAFB] text-[#777980]",
	RUNNING: "bg-[#E8F5E9] text-[#2E7D32]",
	SCHEDULED: "bg-[#FFF7E6] text-[#FFAF00]",
	SUSPENDED: "bg-[#FFE6E6] text-[#FF4345]",
};

interface CampaignColumnsParams {
	onEdit: (c: Campaign) => void;
	onDelete: (c: Campaign) => void;
	onLaunch?: (c: Campaign) => void;
	onStatusAction?: (c: Campaign, action: "SUSPEND" | "RESTART") => void;
}

export function createCampaignColumns({
	onEdit,
	onDelete,
	onLaunch,
	onStatusAction,
}: CampaignColumnsParams): Column<Campaign>[] {
	return [
		{
			key: "name",
			header: "Campaign Name",
			render: (row) => (
				<span className="text-[#1B1B1B] font-inter text-sm font-medium">
					{row.name}
				</span>
			),
		},
		{
			key: "subject",
			header: "Subject",
			render: (row) => (
				<span className="text-[#1B1B1B] font-inter text-sm truncate max-w-50 block">
					{row.emailConfig.subject}
				</span>
			),
		},
		{
			key: "recipients",
			header: "Recipients",
			render: (row) => (
				<span className="text-[#1B1B1B] font-inter text-sm">
					{row.analytics.SENT.toLocaleString()}
				</span>
			),
		},
		{
			key: "clicks",
			header: "Clicks",
			render: (row) => (
				<span className="text-[#1B1B1B] font-inter text-sm">
					{row.analytics.CLICKED.toLocaleString()}
				</span>
			),
		},
		{
			key: "status",
			header: "Status",
			render: (row) => (
				<span
					className={`inline-flex py-1.5 px-3 justify-center items-center gap-1 rounded-md text-sm font-medium capitalize ${STATUS_STYLES[row.status] || STATUS_STYLES.DRAFT
						}`}
				>
					{row.status}
				</span>
			),
		},
		{
			key: "actions",
			header: "",
			className: "w-12",
			render: (row) => {
				const items = buildActions(row, { onEdit, onDelete, onLaunch, onStatusAction });
				return <ActionsDropdown items={items} />;
			},
		},
	];
}

function buildActions(
	row: Campaign,
	{ onEdit, onDelete, onLaunch, onStatusAction }: CampaignColumnsParams
) {
	const isLocked = row.status === "SCHEDULED" || row.status === "COMPLETED" || row.status === "RUNNING"

	const items: { label: string; onClick: () => void; variant?: 'danger'; disabled?: boolean; permission?: string }[] = [];
	items.push({
		label: "Edit",
		onClick: () => onEdit(row),
		disabled: isLocked,
		permission: PERMISSIONS.campaign.update,
	});

	// Delete - locked for SCHEDULED, COMPLETED, RUNNING
	items.push({
		label: "Delete",
		onClick: () => onDelete(row),
		variant: "danger" as const,
		disabled: isLocked,
		permission: PERMISSIONS.campaign.delete,
	});


	if (row.status === "DRAFT" && onLaunch) {
		items.splice(1, 0, {
			label: "Launch",
			onClick: () => onLaunch(row),
			disabled: false,
			permission: PERMISSIONS.campaign.update,
		});
	}

	if (row.status === "ACTIVE" && onStatusAction) {
		items.splice(1, 0, {
			label: "Suspend",
			onClick: () => onStatusAction(row, "SUSPEND"),
			variant: "danger" as const,
			disabled: false,
			permission: PERMISSIONS.campaign.update,
		});
	}
	if (row.status === "SUSPENDED" && onStatusAction) {
		items.splice(1, 0, {
			label: "Restart",
			onClick: () => onStatusAction(row, "RESTART"),
			disabled: false,
			permission: PERMISSIONS.campaign.update,
		});
	}

	return items;
}