"use client";

import { useState } from "react";
import { addLeadNote } from "@/services/lead-detail.service";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Trash2 } from "lucide-react";


interface NotesListProps {
    leadId: string;
    notes: { id: string; content: string; author: string; date: string }[];
    onNoteAdded: () => void;
    onDeleteNote: (content: string) => void;
}

export function NotesList({
    leadId,
    notes,
    onNoteAdded,
    onDeleteNote,
}: NotesListProps) {
    const [newNote, setNewNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    return (
        <div className="flex flex-col gap-3">
            <span className="text-[#777980] font-inter text-sm font-medium">Notes</span>


            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto adm-notes-scroll pr-1">
                {notes.length === 0 ? (
                    <p className="text-sm text-[#777980] text-center py-4">No notes yet</p>
                ) : (
                    notes.map((note) => (
                        <div
                            key={note.id}
                            className="flex justify-between items-center gap-2 p-3 rounded-lg border border-[#DFE1E7] bg-white"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-[#1B1B1B] break-words whitespace-pre-wrap">
                                    {note.content}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-[#777980]">{note.date}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => onDeleteNote(note.content)}
                                className="text-[#777980] hover:text-[#FF4345] transition-colors shrink-0"
                                aria-label="Delete note"
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
        </div>
    );
}