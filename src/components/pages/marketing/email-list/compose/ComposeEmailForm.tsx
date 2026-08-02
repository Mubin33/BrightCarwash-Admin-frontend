'use client';

import { useRef, useState } from "react";
import { X, Paperclip } from "lucide-react";
import type { ComposeEmailFormState } from "@/types/email-list";

interface ComposeEmailFormProps {
    form: ComposeEmailFormState;
    updateField: <K extends keyof ComposeEmailFormState>(key: K, value: ComposeEmailFormState[K]) => void;
    addEmail: (field: "to" | "cc" | "bcc", email: string) => void;
    removeEmail: (field: "to" | "cc" | "bcc", email: string) => void;
    addFiles: (files: FileList) => void;
    removeFile: (index: number) => void;
    toggleCcBcc: () => void;
}

const labelClass = "text-[#777980] font-inter text-sm font-medium w-[100px] shrink-0";
const inputClass = "w-full px-4 py-2.5 border border-[#DFE1E7] rounded-lg bg-white text-[#1B1B1B] placeholder-[#777980] font-inter text-sm outline-none focus:border-[#0098E8] transition-all";

function EmailInput({
    emails,
    placeholder,
    onAdd,
    onRemove,
}: {
    emails: string[];
    placeholder: string;
    onAdd: (email: string) => void;
    onRemove: (email: string) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [inputValue, setInputValue] = useState("");

    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    };

    const handleAddEmail = () => {
        const email = inputValue.trim();
        if (email && isValidEmail(email) && !emails.includes(email)) {
            onAdd(email);
            setInputValue("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddEmail();
        }
        // ✅ Remove comma and space triggers - only one email allowed
    };

    const handleBlur = () => {
        handleAddEmail();
    };

    return (
        <div
            className="flex flex-wrap items-center gap-1.5 px-3 py-2 border border-[#DFE1E7] rounded-lg bg-white cursor-text min-h-[44px]"
            onClick={() => inputRef.current?.focus()}
        >
            {emails.map((email) => (
                <span
                    key={email}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#EBF5FF] text-[#0098E8] font-inter text-xs"
                >
                    {email}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove(email);
                        }}
                        className="hover:text-[#FF4345] transition-colors"
                    >
                        <X size={12} />
                    </button>
                </span>
            ))}
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                placeholder={emails.length === 0 ? placeholder : ""}
                className="flex-1 min-w-[120px] border-none outline-none text-sm text-[#1B1B1B] placeholder-[#777980] font-inter bg-transparent"
            />
        </div>
    );
}

export function ComposeEmailForm({
    form,
    addEmail,
    removeEmail,
    addFiles,
    removeFile,
    toggleCcBcc,
    updateField
}: ComposeEmailFormProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="flex flex-col gap-4">
            {/* To */}
            <div className="flex items-start gap-4">
                <label className={labelClass}>To</label>
                <div className="flex-1 flex flex-col gap-1">
                    <EmailInput
                        emails={form.to}
                        placeholder="Type email and press Enter"
                        onAdd={(email) => addEmail("to", email)}
                        onRemove={(email) => removeEmail("to", email)}
                    />
                    <button
                        type="button"
                        onClick={toggleCcBcc}
                        className="text-[#0098E8] font-inter text-xs text-left hover:underline w-fit"
                    >
                        {form.showCcBcc ? "Hide Cc/Bcc" : "+ Show Cc/Bcc"}
                    </button>
                </div>
            </div>

            {/* Cc */}
            {form.showCcBcc && (
                <div className="flex items-start gap-4">
                    <label className={labelClass}>Cc</label>
                    <div className="flex-1">
                        <EmailInput
                            emails={form.cc}
                            placeholder="Type email and press Enter"
                            onAdd={(email) => addEmail("cc", email)}
                            onRemove={(email) => removeEmail("cc", email)}
                        />
                    </div>
                </div>
            )}

            {/* Bcc */}
            {form.showCcBcc && (
                <div className="flex items-start gap-4">
                    <label className={labelClass}>Bcc</label>
                    <div className="flex-1">
                        <EmailInput
                            emails={form.bcc}
                            placeholder="Type email and press Enter"
                            onAdd={(email) => addEmail("bcc", email)}
                            onRemove={(email) => removeEmail("bcc", email)}
                        />
                    </div>
                </div>
            )}

            {/* Subject */}
            <div className="flex items-start gap-4">
                <label className={labelClass}>Subject</label>
                <div className="flex-1">
                    <input
                        type="text"
                        value={form.subject}
                        onChange={(e) => updateField("subject", e.target.value)}
                        placeholder="Enter subject"
                        className={inputClass}
                    />
                </div>
            </div>

            {/* Files */}
            <div className="flex items-start gap-4">
                <label className={labelClass}>Files</label>
                <div className="flex-1 flex flex-col gap-2">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2.5 border border-[#DFE1E7] rounded-lg bg-white text-[#777980] font-inter text-sm hover:border-[#0098E8] transition-all w-fit"
                    >
                        <Paperclip size={16} />
                        Attach a file
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={(e) => e.target.files && addFiles(e.target.files)}
                        className="hidden"
                    />
                    {form.files.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {form.files.map((file, i) => (
                                <span
                                    key={`${file.name}-${i}`}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#F8FAFB] border border-[#DFE1E7] text-[#1B1B1B] font-inter text-xs"
                                >
                                    {file.name}
                                    <button
                                        type="button"
                                        onClick={() => removeFile(i)}
                                        className="text-[#777980] hover:text-[#FF4345] transition-colors"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}