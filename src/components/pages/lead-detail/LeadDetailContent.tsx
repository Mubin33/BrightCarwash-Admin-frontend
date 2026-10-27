"use client";

import { apiFetch } from "@/lib/api-fetch";

import { useState, useEffect, useCallback } from "react";
import { LeadInfoCard } from "@/components/pages/lead-detail/LeadInfoCard";
import { NotesSection } from "@/components/pages/lead-detail/NotesSection";
import { ActivityTimeline } from "@/components/pages/lead-detail/ActivityTimeline";
import { AssignmentHistory } from "@/components/pages/lead-detail/AssignmentHistory";
import { AssignMemberModal } from "@/components/pages/lead-detail/AssignMemberModal";
import { LeadDetailHeader } from "@/components/pages/lead-detail/LeadDetailHeader";
import { useLeadDetail } from "@/hooks/useLeadDetail";
import { useLeadAssignment } from "@/hooks/useLeadAssignment";
import { updateLeadDetails } from "@/services/lead-detail.service";
import { getStages } from "@/services/stage.service";
import { mapStagesToOptions } from "@/lib/stage-utils";
import type { StageOption } from "@/components/ui/StageDropdown";
import { toast } from "react-toastify";
import { EditLeadModal } from "@/components/pages/lead-detail/EditLeadModal";

interface Props {
	leadId: string;
}

export function LeadDetailContent({ leadId }: Props) {
	const [assignModalOpen, setAssignModalOpen] = useState(false);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [stages, setStages] = useState<StageOption[]>([]);

	const {
		lead,
		activities,
		initialLoading,
		triggerRefresh,
		deleteNote,
		} = useLeadDetail(leadId);

	const { handleAssign } = useLeadAssignment(
		leadId,
		lead,
		triggerRefresh
	);

	const fetchStages = useCallback(() => {
		getStages().then((s) => {
			setStages(mapStagesToOptions(s));
		});
	}, []);

	useEffect(() => {
		fetchStages();
	}, [fetchStages]);

	const handleDepositStatusChange = async (newStatus: string) => {
		try {
			await updateLeadDetails(leadId, { deposit_status: newStatus });
			toast.success(`Deposit status updated to ${newStatus}`);
			triggerRefresh();
		} catch (err) {
			const error = err as { message?: string };
			toast.error(error.message || "Failed to update deposit status");
			throw err;
		}
	};

	const handleStageChange = async (newStage: string) => {
		try {
			await updateLeadDetails(leadId, { stage_name: newStage });
			toast.success(`Stage updated to ${newStage}`);
			triggerRefresh();
		} catch (err) {
			const error = err as { message?: string };
			toast.error(error.message || "Failed to update stage");
			throw err;
		}
	};

	const handleNoteAdded = () => {
		triggerRefresh();
	};

	const handleDeleteNote = async (noteContent: string) => {
		try {
			await deleteNote(noteContent);
			triggerRefresh();
			toast.success("Note deleted");
		} catch {
			toast.error("Failed to delete note");
		}
	};

	const handleUpload = async (files: File[]) => {
		try {
			await updateLeadDetails(leadId, { files });
			toast.success(`${files.length} file(s) uploaded successfully`);
			triggerRefresh();
		} catch {
			toast.error("Failed to upload files");
		}
	};



	const handleDeleteAttachment = async (attachmentId: string) => {
		try {
			const attachment = lead?.attachments?.find((a) => a.id === attachmentId);
			if (!attachment) {
				toast.error('Attachment not found');
				return;
			}

			const payload = { path: attachment.fileName };
			const response = await apiFetch(
				`/admin/lead/${leadId}/attachments`,
				{
					method: 'DELETE',
					body: JSON.stringify(payload),
				}
			);

			const responseData = await response.json().catch(() => ({}));

			if (!response.ok) {
				throw new Error(responseData.message || responseData.error || 'Failed to delete attachment');
			}


			toast.success(`"${attachment.fileName}" deleted`);
			triggerRefresh();
		} catch (err) {
        const error = err as { data?: { message?: string }; message?: string };
			toast.error(error.message || 'Failed to delete attachment');
		}
	};


	const handleDownloadAttachment = async (attachmentId: string) => {
		try {
			const attachment = lead?.attachments?.find((a) => a.id === attachmentId);
			if (!attachment) {
				toast.error('File not found');
				return;
			}


			const response = await apiFetch(attachment.url);

			if (!response.ok) {
				throw new Error('Failed to download file');
			}


			const blob = await response.blob();

			const contentDisposition = response.headers.get('Content-Disposition');
			let fileName = attachment.fileName;
			if (contentDisposition) {
				const match = contentDisposition.match(/filename="?(.+?)"?$/);
				if (match) fileName = match[1];
			}

			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = fileName;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);

			toast.success(`Downloading ${fileName}`);
		} catch (err) {
			// A-H5 Fallback: Cross-origin storage reads may be blocked by CORS in the browser.
			// Trigger direct browser navigation/download so the storage URL can be fetched directly.
			const attachment = lead?.attachments?.find((a) => a.id === attachmentId);
			if (attachment?.url) {
				try {
					const directLink = document.createElement('a');
					directLink.href = attachment.url;
					directLink.target = '_blank';
					directLink.rel = 'noopener noreferrer';
					directLink.download = attachment.fileName || 'download';
					document.body.appendChild(directLink);
					directLink.click();
					document.body.removeChild(directLink);
					toast.success(`Downloading ${attachment.fileName || 'attachment'}`);
					return;
				} catch {}
			}
			const error = err as { data?: { message?: string }; message?: string };
			toast.error(error.message || 'Failed to download file');
		}
	};

	const handleEditSave = async (data: Parameters<typeof updateLeadDetails>[1]) => {
		await updateLeadDetails(leadId, data);
		triggerRefresh();
	};

	if (initialLoading)
		return <div className="h-[400px] bg-gray-100 rounded-lg animate-pulse" />;
	if (!lead) return <div className="text-[#FF4345]">Lead not found</div>;

	return (
		<div className="flex flex-col gap-4 w-full">
			{/* ✅ Header with buttons */}
			<LeadDetailHeader
				leadEmail={lead.email}
				onAssignClick={() => setAssignModalOpen(true)}
				onEditClick={() => setEditModalOpen(true)}
			/>

			{/* Main content */}
			<div className="flex items-start gap-5 self-stretch max-lg:flex-col">
				<div className="flex flex-col gap-5 flex-1 min-w-0">
					<LeadInfoCard lead={lead} stages={stages} onStageChange={handleStageChange} onStageCreated={fetchStages} onDepositStatusChange={handleDepositStatusChange} />
					<NotesSection
						leadId={leadId}
						notes={lead.notes}
						attachments={lead.attachments || []}
						onNoteAdded={handleNoteAdded}
						onDeleteNote={handleDeleteNote}
						onUpload={handleUpload}
						onDeleteAttachment={handleDeleteAttachment}
						onDownloadAttachment={handleDownloadAttachment}
					/>
				</div>

				<div className="flex flex-col gap-5 w-[450px] max-lg:w-full shrink-0 min-h-full sticky top-24">
					<ActivityTimeline activities={activities} />
					<AssignmentHistory activities={activities} />
				</div>
			</div>

			<AssignMemberModal
				isOpen={assignModalOpen}
				onClose={() => setAssignModalOpen(false)}
				leadId={leadId}
				currentAssigneeId={lead.assignedToId}
				currentAssigneeName={lead.assignedToName}
				onAssign={handleAssign}
			/>

			<EditLeadModal
				isOpen={editModalOpen}
				onClose={() => setEditModalOpen(false)}
				lead={lead}
				stages={stages}
				onSave={handleEditSave}
			/>
		</div>
	);
}