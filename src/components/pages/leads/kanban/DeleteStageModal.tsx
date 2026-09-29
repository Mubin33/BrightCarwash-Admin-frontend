"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { deleteStage } from "@/services/stage.service";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

interface DeleteStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  stageId: string;
  stageTitle: string;
  leadCount: number;
  onDeleted: () => void;
}

export function DeleteStageModal({
  isOpen,
  onClose,
  stageId,
  stageTitle,
  leadCount,
  onDeleted,
}: DeleteStageModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const hasLeads = leadCount > 0;

  const handleDelete = async () => {
    if (hasLeads) return;
    setIsDeleting(true);
    try {
      await deleteStage(stageId);
      toast.success(`Stage "${stageTitle}" deleted successfully`);
      onDeleted();
      onClose();
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error?.message || "Failed to delete stage");
    } finally {
      setIsDeleting(false);
    }
  };

  const modalTitle = hasLeads ? (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-[#FEF3F2] flex items-center justify-center shrink-0">
        <AlertTriangle className="text-[#D92D20]" size={20} />
      </div>
      <div>
        <span className="text-[#1B1B1B] font-inter text-lg font-semibold">
          Cannot Delete Stage
        </span>
        <p className="text-[#777980] font-inter text-xs">
          Stage contains active leads
        </p>
      </div>
    </div>
  ) : (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-[#FEF3F2] flex items-center justify-center shrink-0">
        <Trash2 className="text-[#D92D20]" size={20} />
      </div>
      <div>
        <span className="text-[#1B1B1B] font-inter text-lg font-semibold">
          Delete Stage
        </span>
        <p className="text-[#777980] font-inter text-xs">
          Confirm stage deletion
        </p>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="md">
      {hasLeads ? (
        <div className="flex flex-col gap-5">
          <div className="p-4 rounded-xl bg-[#FFF4F3] border border-[#FECDCA] flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#B42318] font-semibold text-sm">
              <AlertTriangle size={18} className="shrink-0" />
              <span>
                This stage contains {leadCount} active {leadCount === 1 ? "lead" : "leads"}
              </span>
            </div>
            <p className="text-[#B42318] text-xs leading-relaxed">
              All leads must be moved or reassigned to another stage before this stage can be deleted. Please drag and drop the leads to a different stage and try again.
            </p>
          </div>

          <p className="text-[#475467] text-sm leading-relaxed">
            You cannot delete <strong>&quot;{stageTitle}&quot;</strong> while it contains leads. Clear the stage by moving all leads to another stage first.
          </p>

          <div className="flex justify-end pt-3 border-t border-[#E8E8E9]">
            <Button
              type="button"
              variant="primary"
              onClick={onClose}
              className="px-6 rounded-xl"
            >
              Understood
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <p className="text-[#475467] text-sm leading-relaxed">
            Are you sure you want to delete the stage <strong>&quot;{stageTitle}&quot;</strong>? This action cannot be undone.
          </p>

          <div className="flex gap-3 justify-end pt-3 border-t border-[#E8E8E9]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isDeleting}
              className="px-6 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              isLoading={isDeleting}
              loadingText="Deleting..."
              className="px-6 rounded-xl bg-[#D92D20] hover:bg-[#B42318] text-white"
            >
              Delete Stage
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
