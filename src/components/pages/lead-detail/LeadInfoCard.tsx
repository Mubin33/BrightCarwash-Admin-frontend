"use client";

import { Icon } from "@/components/ui/Icon";
import { PriorityBadge } from "@/lib/priority-utils";
import type { LeadDetail } from "@/types/lead-detail";

interface LeadInfoCardProps {
	lead: LeadDetail;
}

export function LeadInfoCard({ lead }: LeadInfoCardProps) {
	return (
		<div className="flex p-5 flex-col items-start gap-4 self-stretch rounded-lg border border-[#DFE1E7] bg-white">
			<div className="flex justify-between items-start self-stretch">
				<h3 className="text-[#1A1C21] font-inter text-lg font-semibold">Lead Information</h3>
				<div className="flex items-center gap-2">
					{/* ✅ Priority Badge */}
					<PriorityBadge priority={lead.priority} />
					{/* Stage Badge */}
					<span
						className="inline-flex py-1 px-3 justify-center items-center gap-1 rounded-full text-xs font-medium capitalize"
						style={{
							color: lead.stageColor,
							backgroundColor: lead.stageColor + '26',
							border: `1px solid ${lead.stageColor}`,
						}}
					>
						{lead.stage}
					</span>
				</div>
			</div>

			<div className="w-full h-px bg-[#DFE1E7]" />

			<div className="grid grid-cols-2 gap-4 w-full">
				<div className="flex flex-col gap-1">
					<span className="text-xs text-[#777980] font-inter">Name</span>
					<span className="text-sm text-[#1B1B1B] font-inter font-medium">{lead.name}</span>
				</div>
				<div className="flex flex-col gap-1">
					<span className="text-xs text-[#777980] font-inter">Email</span>
					<span className="text-sm text-[#1B1B1B] font-inter font-medium">{lead.email}</span>
				</div>
				<div className="flex flex-col gap-1">
					<span className="text-xs text-[#777980] font-inter">Phone</span>
					<span className="text-sm text-[#1B1B1B] font-inter font-medium">{lead.phone}</span>
				</div>
				<div className="flex flex-col gap-1">
					<span className="text-xs text-[#777980] font-inter">Source</span>
					<span className="text-sm text-[#1B1B1B] font-inter font-medium">{lead.source}</span>
				</div>
				<div className="flex flex-col gap-1">
					<span className="text-xs text-[#777980] font-inter">Service</span>
					<span className="text-sm text-[#1B1B1B] font-inter font-medium">{lead.service}</span>
				</div>
				<div className="flex flex-col gap-1">
					<span className="text-xs text-[#777980] font-inter">Vehicle</span>
					<span className="text-sm text-[#1B1B1B] font-inter font-medium">{lead.vehicle}</span>
				</div>
				<div className="flex flex-col gap-1">
					<span className="text-xs text-[#777980] font-inter">Deposit Status</span>
					<span className="text-sm text-[#1B1B1B] font-inter font-medium">{lead.depositStatus}</span>
				</div>
				<div className="flex flex-col gap-1">
					<span className="text-xs text-[#777980] font-inter">Date</span>
					<span className="text-sm text-[#1B1B1B] font-inter font-medium">{lead.date}</span>
				</div>
			</div>

			{/* ✅ Assigned To - Always visible */}
			<div className="flex items-center gap-2 mt-2 pt-4 border-t border-[#DFE1E7] w-full">
				<Icon name="staffs" width={16} height={16} color="#777980" />
				<span className="text-sm text-[#777980] font-inter">Assigned to:</span>
				{lead.assignedToName ? (
					<span className="text-sm text-[#1B1B1B] font-inter font-medium">{lead.assignedToName}</span>
				) : (
					<span className="text-sm text-[#A5A5AB] font-inter italic">No member assigned</span>
				)}
			</div>
		</div>
	);
}