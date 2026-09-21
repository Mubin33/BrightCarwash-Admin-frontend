"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FormInput } from "@/components/ui/FormInput";

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSubject?: string;
  initialPreview?: string;
  onSave?: (subject: string, preview: string) => void;
}

const labelClass =
  "text-[#777980] font-inter text-base font-normal leading-[130%]";
const inputClass =
  "px-4 py-3 border-[#DFE1E7] rounded-lg bg-white text-[#1B1B1B] placeholder-[#777980] font-inter text-sm outline-none focus:border-[#0098E8] focus:ring-2 focus:ring-[#0098E8]/10 transition-all shadow-none";

export function SubjectModal({
  isOpen,
  onClose,
  initialSubject = "",
  initialPreview = "",
  onSave,
}: SubjectModalProps) {
  const [subject, setSubject] = useState(initialSubject);
  const [subjectError, setSubjectError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSubject(initialSubject);
      setSubjectError("");
    }
  }, [isOpen, initialSubject]);

  const modalTitle = (
    <div className="flex flex-col gap-1">
      <span className="text-[#1D1F2C] font-inter text-2xl font-medium leading-[100%]">
        Subject
      </span>
      <span className="text-[#777980] font-inter text-sm font-normal leading-[132%]">
        Add a subject line for this campaign.
      </span>
    </div>
  );
  const handleSave = () => {
    const trimmedSubject = subject.trim();

    if (!trimmedSubject) {
      setSubjectError("Subject is required.");
      return;
    }

    onSave?.(trimmedSubject, "");
    onClose();
  };

  // const handleSave = () => {
  //   if (onSave) {
  //     onSave(subject, "");
  //   }
  //   onClose();
  // };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      size="md"
      bodyClassName="py-3"
    >
      <div className="flex flex-col gap-4">
        <div className="w-full h-px bg-[#DFE1E7]" />

        <FormInput
          id="subject"
          label="Subject Text"
          type="text"
          value={subject}
          onChange={(e) => {
            setSubject(e.target.value);

            if (e.target.value.trim()) {
              setSubjectError("");
            }
          }}
          placeholder="Enter subject line"
          labelClassName={labelClass}
          className={`${inputClass} ${
            subjectError
              ? "border-[#DC2626]! focus:border-[#DC2626]! focus:ring-[#DC2626]/10!"
              : ""
          }`}
        />
        {subjectError && (
          <p className=" text-sm text-[#DC2626] font-inter">{subjectError}</p>
        )}
        <div>
          <label className={labelClass}>Preview</label>
          <div className="flex flex-col gap-1 p-3 rounded-xl border border-[#DFE1E7] bg-white mt-1.5">
            <span className="text-[#1D1F2C] font-inter text-sm font-bold leading-[140%] wrap-break-word">
              {subject.length > 100
                ? subject.slice(0, 100) + "..."
                : subject || "Subject line"}
            </span>
            <span className="text-[#777980] font-inter text-xs leading-[140%]">
              Preview text appears here...
            </span>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 py-2.5"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1 py-2.5">
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}
