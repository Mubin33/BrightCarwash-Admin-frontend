"use client";

import { useState, useMemo } from "react";
import { addLeadNote } from "@/services/lead-detail.service";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Trash2 } from "lucide-react";
import { formatStandardDateTime } from "@/lib/date-utils";

interface NotesListProps {
    leadId: string;
    notes: { id: string; content: string; author: string; date: string }[];
    onNoteAdded: () => void;
    onDeleteNote: (content: string) => void | Promise<void>;
}


function getDisplayContent(content: string): string {
    if (!content) return "";
    const str = content.trim();
    if (str.startsWith("{")) {
        try {
            const parsed = JSON.parse(str);
            if (parsed && typeof parsed === "object" && parsed.content) {
                return String(parsed.content);
            }
        } catch {
            // Graceful fallback: string is not JSON, proceed to regex / plain-text extraction
        }
    }
    const match = str.match(/^"?content"?\s*:\s*"([^"]*)"?$/i);
    if (match) return match[1];
    return str.replace(/^"(.*)"$/, "$1");
}

export function NotesList({
    leadId,
    notes,
    onNoteAdded,
    onDeleteNote,
}: NotesListProps) {
    const [newNote, setNewNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState<{ id: string; content: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Sort notes in descending order (last added / newest first)
    const sortedNotes = useMemo(() => {
        const valid = (notes || []).filter((n) => {
            if (!n || !n.content) return false;
            const str = n.content.trim();
            if (/^"?(author|date|created_at|id)"?\s*:/i.test(str)) {
                return false;
            }
            return true;
        });

        const reversed = [...valid].reverse();
        return reversed.sort((a, b) => {
            const timeA = a.date ? new Date(a.date).getTime() : 0;
            const timeB = b.date ? new Date(b.date).getTime() : 0;
            if (!isNaN(timeA) && !isNaN(timeB) && timeA !== timeB) {
                return timeB - timeA;
            }
            return 0;
        });
    }, [notes]);

    const handleAddNote = async () => {
        if (!newNote.trim()) return;
        setIsSubmitting(true);
        try {
            await addLeadNote(leadId, newNote.trim());
            setNewNote("");
            onNoteAdded();
            toast.success("Note added");
        } catch {
            toast.error("Failed to add note");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleAddNote();
        }
    };

    const handleConfirmDelete = async () => {
        if (!noteToDelete) return;
        setIsDeleting(true);
        try {
            await onDeleteNote(noteToDelete.id);
            setNoteToDelete(null);
        } catch {
            // Error handled by parent or toast
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <span className="text-[#777980] font-inter text-sm font-medium">Notes</span>

            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto adm-notes-scroll pr-1">
                {sortedNotes.length === 0 ? (
                    <p className="text-sm text-[#777980] text-center py-4">No notes yet</p>
                ) : (
                    sortedNotes.map((note) => (
                        <div
                            key={note.id}
                            className="flex justify-between items-center gap-2 p-3 rounded-lg border border-[#DFE1E7] bg-white"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-[#1B1B1B] break-words whitespace-pre-wrap">
                                    {getDisplayContent(note.content)}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-[#777980]">{formatStandardDateTime(note.date)}</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setNoteToDelete({ id: note.id, content: note.content })}
                                className="text-[#777980] hover:text-[#FF4345] transition-colors shrink-0 p-1"
                                aria-label="Delete note"
                                title="Delete note"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Add Note Input - separate from scroll area */}
            <div className="flex flex-col gap-2 mt-2">
                <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Write a note..."
                    rows={2}
                    className="w-full px-3 py-2 border border-[#DFE1E7] rounded-lg text-sm text-[#1B1B1B] placeholder-[#777980] outline-none focus:border-[#0098E8] resize-none font-inter bg-white"
                />
                <Button
                    onClick={handleAddNote}
                    isLoading={isSubmitting}
                    loadingText="..."
                    disabled={!newNote.trim()}
                    className="w-full"
                >
                    <Icon name="plus" width={16} height={16} color="white" className="mr-1" />
                    Add notes
                </Button>
            </div>

            {/* Delete Note Confirmation Modal */}
            {noteToDelete && (
                <Modal
                    isOpen={!!noteToDelete}
                    onClose={() => {
                        if (!isDeleting) setNoteToDelete(null);
                    }}
                    title={
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#FEF3F2] flex items-center justify-center shrink-0">
                                <Trash2 className="text-[#D92D20]" size={20} />
                            </div>
                            <div>
                                <span className="text-[#1B1B1B] font-inter text-lg font-semibold">
                                    Delete Note
                                </span>
                                <p className="text-[#777980] font-inter text-xs">
                                    Confirm note deletion
                                </p>
                            </div>
                        </div>
                    }
                    size="sm"
                >
                    <div className="flex flex-col gap-4">
                        <p className="text-[#475467] text-sm leading-relaxed">
                            Are you sure you want to delete this note? This action cannot be undone.
                        </p>

                        {noteToDelete.content && (
                            <div className="p-3 rounded-lg border border-[#DFE1E7] bg-[#F8FAFB] text-xs text-[#1B1B1B] italic max-h-24 overflow-y-auto whitespace-pre-wrap break-words">
                                &quot;{getDisplayContent(noteToDelete.content)}&quot;
                            </div>
                        )}

                        <div className="flex gap-3 justify-end pt-3 border-t border-[#E8E8E9]">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setNoteToDelete(null)}
                                disabled={isDeleting}
                                className="px-5 rounded-xl"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="danger"
                                onClick={handleConfirmDelete}
                                isLoading={isDeleting}
                                loadingText="Deleting..."
                                className="px-5 rounded-xl bg-[#D92D20] hover:bg-[#B42318] text-white"
                            >
                                Delete Note
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
