"use client";

import { NotesList } from "./NotesSection/NotesList";
import { AttachmentsSection } from "./NotesSection/AttachmentsSection";

interface NotesSectionProps {
	leadId: string;
	notes: { id: string; content: string; author: string; date: string }[];
	attachments?: { id: string; url: string; fileName: string; fileSize: number; mimeType: string; uploadedAt?: string }[];
	onNoteAdded: () => void;
	onDeleteNote: (content: string) => void;
	onUpload?: (files: File[]) => void;
	onDeleteAttachment?: (id: string) => void;
	onDownloadAttachment?: (id: string) => void;
}

export function NotesSection({
	leadId,
	notes,
	attachments = [],
	onNoteAdded,
	onDeleteNote,
	onUpload,
	onDeleteAttachment,
	onDownloadAttachment,
}: NotesSectionProps) {
	return (
		<div className="flex p-5 flex-col items-start gap-4 self-stretch rounded-lg border border-[#DFE1E7] bg-white">
			<h3 className="text-[#1A1C21] font-inter text-lg font-semibold">Notes & Attachments</h3>
			<div className="w-full h-px bg-[#DFE1E7]" />

			{/* Split Layout: Notes (Half) + Attachments (Half) */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
				{/* LEFT: Notes Section */}
				<NotesList
					leadId={leadId}
					notes={notes}
					onNoteAdded={onNoteAdded}
					onDeleteNote={onDeleteNote}
				/>

				{/* RIGHT: Attachments Section */}
				<AttachmentsSection
					attachments={attachments}
					onUpload={onUpload}
					onDelete={onDeleteAttachment}
					onDownload={onDownloadAttachment}
				/>
			</div>
		</div>
	);
}