"use client";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import type { KnowledgeFile } from "@/types/knowledge";
import { Trash2 } from "lucide-react";

interface DeleteKnowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: KnowledgeFile | null;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

const getFileExtension = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toUpperCase() || "Unknown";
  const typeMap: Record<string, string> = {
    PDF: "PDF",
    DOCX: "Word",
    DOC: "Word",
    TXT: "Text",
    CSV: "CSV",
    XLSX: "Excel",
    XLS: "Excel",
  };
  return typeMap[ext] || ext;
};

const formatDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

export function DeleteKnowledgeModal({
  isOpen,
  onClose,
  file,
  onConfirm,
  isLoading,
}: DeleteKnowledgeModalProps) {
  if (!file) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isLoading) onClose();
      }}
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FEF3F2] flex items-center justify-center shrink-0">
            <Trash2 className="text-[#D92D20]" size={20} />
          </div>
          <div>
            <span className="text-[#1B1B1B] font-inter text-lg font-semibold">
              Delete Document
            </span>
            <p className="text-[#777980] font-inter text-xs">
              Confirm knowledge base document deletion
            </p>
          </div>
        </div>
      }
      size="sm"
    >
      <div className="flex flex-col gap-4">
        <p className="text-[#475467] text-sm leading-relaxed">
          Are you sure you want to delete this document from the knowledge base? This action cannot be undone.
        </p>

        <div className="p-3.5 rounded-xl border border-[#DFE1E7] bg-[#F8FAFB] flex flex-col gap-2.5 text-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Icon name="file" width={18} height={18} />
              <span className="text-[#1B1B1B] font-semibold text-sm truncate">
                {file.title}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-[#E6F5FD] text-[#0098E8] font-medium text-[11px] shrink-0">
              {getFileExtension(file.file || file.title)}
            </span>
          </div>

          <div className="flex flex-col gap-1 text-[#777980] text-[12px] pt-2 border-t border-[#E8E8E9]">
            <div className="flex items-center justify-between">
              <span className="text-[#98A2B3]">Chunks:</span>
              <span className="text-[#344054] font-medium">
                {file.chunk_count || 0} chunks
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#98A2B3]">Uploaded Date:</span>
              <span className="text-[#344054]">
                {formatDate(file.uploaded_at)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#98A2B3]">Status:</span>
              <span
                className={`font-medium ${
                  file.is_processed
                    ? "text-green-600"
                    : file.processing_error
                      ? "text-red-600"
                      : "text-yellow-600"
                }`}
              >
                {file.is_processed
                  ? "✓ Processed"
                  : file.processing_error
                    ? "⚠ Failed"
                    : "⏳ Processing"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-3 border-t border-[#E8E8E9]">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="px-5 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            isLoading={isLoading}
            loadingText="Deleting..."
            className="px-5 rounded-xl bg-[#D92D20] hover:bg-[#B42318] text-white"
          >
            Delete Document
          </Button>
        </div>
      </div>
    </Modal>
  );
}
