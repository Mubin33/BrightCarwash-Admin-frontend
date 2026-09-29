"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { PriorityBadge } from "@/lib/priority-utils";
import type { LeadDetail } from "@/types/lead-detail";
import { formatStandardDate } from "@/lib/date-utils";
import { StageDropdown, type StageOption } from "@/components/ui/StageDropdown";
import { DepositDropdown } from "@/components/ui/DepositDropdown";
import { getStages } from "@/services/stage.service";
import { mapStagesToOptions } from "@/lib/stage-utils";
import { updateLeadDetails } from "@/services/lead-detail.service";
import { toast } from "react-toastify";

interface LeadInfoCardProps {
	lead: LeadDetail;
	stages?: StageOption[];
	onStageChange?: (newStage: string) => Promise<void> | void;
	onStageCreated?: () => void;
	onDepositStatusChange?: (newStatus: string) => Promise<void> | void;
}

export function LeadInfoCard({
	lead,
	stages,
	onStageChange,
	onStageCreated,
	onDepositStatusChange,
}: LeadInfoCardProps) {
	const [internalStages, setInternalStages] = useState<StageOption[]>([]);
	const [optimisticStage, setOptimisticStage] = useState<string | null>(null);
	const [prevStage, setPrevStage] = useState(lead.stage);

	if (prevStage !== lead.stage) {
		setPrevStage(lead.stage);
		setOptimisticStage(null);
	}

	const currentStage = optimisticStage ?? lead.stage;

	const [optimisticDeposit, setOptimisticDeposit] = useState<string | null>(null);
	const [prevDeposit, setPrevDeposit] = useState(lead.depositStatus);

	if (prevDeposit !== lead.depositStatus) {
		setPrevDeposit(lead.depositStatus);
		setOptimisticDeposit(null);
	}

	const currentDepositStatus = optimisticDeposit ?? (lead.depositStatus || "NONE");

	useEffect(() => {
		if (!stages || stages.length === 0) {
			getStages().then((s) => {
				setInternalStages(mapStagesToOptions(s));
			});
		}
	}, [stages]);

	const availableStages = stages && stages.length > 0 ? stages : internalStages;

	const handleStageSelect = async (newStage: string) => {
		const prev = currentStage;
		setOptimisticStage(newStage);
		try {
			if (onStageChange) {
				await onStageChange(newStage);
			} else {
				await updateLeadDetails(lead.id, { stage_name: newStage });
				toast.success(`Stage updated to ${newStage}`);
			}
		} catch {
			setOptimisticStage(prev);
		}
	};

	const handleDepositSelect = async (newStatus: string) => {
		const prev = currentDepositStatus;
		setOptimisticDeposit(newStatus);
		try {
			if (onDepositStatusChange) {
				await onDepositStatusChange(newStatus);
			} else {
				await updateLeadDetails(lead.id, { deposit_status: newStatus });
				toast.success(`Deposit status updated to ${newStatus}`);
			}
		} catch {
			setOptimisticDeposit(prev);
		}
	};

	return (
		<div className="flex p-5 flex-col items-start gap-4 self-stretch rounded-lg border border-[#DFE1E7] bg-white">
			<div className="flex justify-between items-center self-stretch flex-wrap gap-2">
				<h3 className="text-[#1A1C21] font-inter text-lg font-semibold">Lead Information</h3>
				<div className="flex items-center gap-2 flex-wrap">
					{/* ✅ Priority Badge */}
					<PriorityBadge priority={lead.priority} />

					{/* ✅ Direct Deposit Status Dropdown */}
					{/* <DepositDropdown
						currentStatus={currentDepositStatus}
						onSelect={handleDepositSelect}
					/> */}

					{/* ✅ Direct Stage/Status Dropdown */}
					{availableStages.length > 0 ? (
						<StageDropdown
							currentStage={currentStage}
							stages={availableStages}
							onSelect={handleStageSelect}
							onStageCreated={onStageCreated}
						/>
					) : (
						<span
							className="inline-flex py-1 px-3 justify-center items-center gap-1 rounded-full text-xs font-medium capitalize"
							style={{
								color: lead.stageColor,
								backgroundColor: lead.stageColor + "26",
								border: `1px solid ${lead.stageColor}`,
							}}
						>
							{currentStage}
						</span>
					)}
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
				{/* <div className="flex flex-col gap-1">
					<span className="text-xs text-[#777980] font-inter">Vehicle</span>
					<span className="text-sm text-[#1B1B1B] font-inter font-medium">{lead.vehicle}</span>
				</div> */}
				<div className="flex flex-col gap-1">
					<span className="text-xs text-[#777980] font-inter">Deposit Status</span>
					<span className="text-sm text-[#1B1B1B] font-inter font-medium capitalize">
						{currentDepositStatus?.toLowerCase() || "none"}
					</span>
				</div>
				<div className="flex flex-col gap-1">
					<span className="text-xs text-[#777980] font-inter">Date</span>
					<span className="text-sm text-[#1B1B1B] font-inter font-medium">{formatStandardDate(lead.date)}</span>
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
