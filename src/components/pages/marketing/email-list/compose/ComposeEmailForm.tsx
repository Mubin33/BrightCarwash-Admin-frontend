'use client';

import { useRef, useState } from "react";
import { X, Paperclip } from "lucide-react";
import type { ComposeEmailFormState } from "@/types/email-list";

interface ComposeEmailFormProps {
    form: ComposeEmailFormState;
    updateField: <K extends keyof ComposeEmailFormState>(key: K, value: ComposeEmailFormState[K]) => void;
    addFiles: (files: FileList) => void;
    removeFile: (index: number) => void;
    toggleCcBcc: () => void;
}

const labelClass = "text-[#777980] font-inter text-sm font-medium w-[100px] shrink-0";
const inputClass = "w-full px-4 py-2.5 border border-[#DFE1E7] rounded-lg bg-white text-[#1B1B1B] placeholder-[#777980] font-inter text-sm outline-none focus:border-[#0098E8] transition-all";

// ✅ Single Email Input - adds only on Enter or valid blur
function SingleEmailInput({
    email,
    placeholder,
    onChange,
}: {
    email: string;
    placeholder: string;
    onChange: (value: string) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [inputValue, setInputValue] = useState(email || "");
    const [touched, setTouched] = useState(false);

    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    };

    const handleInputChange = (value: string) => {
        setInputValue(value);
        setTouched(true);
        // ✅ Don't update parent on every keystroke - only when adding
    };

    const handleAddEmail = () => {
        const trimmed = inputValue.trim();
        // ✅ Only add if valid email
        if (trimmed && isValidEmail(trimmed)) {
            onChange(trimmed);
            setInputValue("");
            setTouched(false);
        } else if (trimmed && !isValidEmail(trimmed)) {
            // ❌ Don't add invalid email, show visual feedback instead
            setTouched(true);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddEmail();
        }
        // ✅ Allow backspace to clear input normally
        if (e.key === "Backspace" && inputValue === "" && email) {
            onChange("");
        }
    };

    const handleBlur = () => {
        // ✅ Only add on blur if there's a valid email
        const trimmed = inputValue.trim();
        if (trimmed && isValidEmail(trimmed)) {
            onChange(trimmed);
            setInputValue("");
            setTouched(false);
        } else if (trimmed && !isValidEmail(trimmed)) {
            // ❌ Invalid email - keep in input but mark as error
            setTouched(true);
        }
    };

    const handleRemove = () => {
        onChange("");
        setInputValue("");
        setTouched(false);
    };

    // If there's an email, show the chip
    if (email) {
        return (
            <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 border border-[#DFE1E7] rounded-lg bg-white cursor-text min-h-[44px] border-[#0098E8]">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#EBF5FF] text-[#0098E8] font-inter text-xs">
                    {email}
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="hover:text-[#FF4345] transition-colors"
                    >
                        <X size={12} />
                    </button>
                </span>
            </div>
        );
    }

    // Show input when no email
    return (
        <div
            className={`flex flex-wrap items-center gap-1.5 px-3 py-2 border rounded-lg bg-white cursor-text min-h-[44px] ${touched && inputValue && !isValidEmail(inputValue)
                ? 'border-[#FF4345]'
                : 'border-[#DFE1E7]'
                }`}
            onClick={() => inputRef.current?.focus()}
        >
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                placeholder={placeholder}
                className={`flex-1 min-w-[120px] border-none outline-none text-sm font-inter bg-transparent ${touched && inputValue && !isValidEmail(inputValue)
                    ? 'text-[#FF4345] placeholder:text-[#FF4345]'
                    : 'text-[#1B1B1B] placeholder-[#777980]'
                    }`}
            />
            {/* ✅ Show validation hint */}
            {touched && inputValue && !isValidEmail(inputValue) && (
                <span className="text-[10px] text-[#FF4345] whitespace-nowrap">
                    Invalid email
                </span>
            )}
        </div>
    );
}

export function ComposeEmailForm({
    form,
    updateField,
    addFiles,
    removeFile,
    toggleCcBcc,
}: ComposeEmailFormProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="flex flex-col gap-4">
            {/* To - Single email */}
            <div className="flex items-start gap-4">
                <label className={labelClass}>To</label>
                <div className="flex-1 flex flex-col gap-1">
                    <SingleEmailInput
                        email={form.to}
                        placeholder="Type email and press Enter"
                        onChange={(value) => updateField("to", value)}
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

            {/* Cc - Single email */}
            {form.showCcBcc && (
                <div className="flex items-start gap-4">
                    <label className={labelClass}>Cc</label>
                    <div className="flex-1">
                        <SingleEmailInput
                            email={form.cc}
                            placeholder="Type email and press Enter"
                            onChange={(value) => updateField("cc", value)}
                        />
                    </div>
                </div>
            )}

            {/* Bcc - Single email */}
            {form.showCcBcc && (
                <div className="flex items-start gap-4">
                    <label className={labelClass}>Bcc</label>
                    <div className="flex-1">
                        <SingleEmailInput
                            email={form.bcc}
                            placeholder="Type email and press Enter"
                            onChange={(value) => updateField("bcc", value)}
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