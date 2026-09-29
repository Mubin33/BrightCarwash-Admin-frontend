"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { TeamRole } from "@/types/team";
import { AlertTriangle, Key, Trash2, Users } from "lucide-react";

interface DeleteRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: TeamRole | null;
  memberCount: number;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

const roleColors: Record<string, string> = {
  Admin: "#FF4345",
  Manager: "#006F1F",
  Staff: "#FFAF00",
  "View Only": "#777980",
};

export function DeleteRoleModal({
  isOpen,
  onClose,
  role,
  memberCount,
  onConfirm,
  isLoading,
}: DeleteRoleModalProps) {
  if (!role) return null;

  const color = roleColors[role.name] || "#777980";
  const hasMembers = memberCount > 0;

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
              Delete Role
            </span>
            <p className="text-[#777980] font-inter text-xs">
              Confirm role deletion
            </p>
          </div>
        </div>
      }
      size="sm"
    >
      <div className="flex flex-col gap-4">
        <p className="text-[#475467] text-sm leading-relaxed">
          Are you sure you want to delete the role <strong>&quot;{role.name}&quot;</strong>? This action cannot be undone.
        </p>

        {hasMembers && (
          <div className="p-3 rounded-xl bg-[#FFF4F3] border border-[#FECDCA] flex items-start gap-2.5">
            <AlertTriangle size={18} className="text-[#D92D20] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5 text-xs text-[#B42318] leading-relaxed">
              <span className="font-semibold">Notice regarding assigned members:</span>
              <span>
                There {memberCount === 1 ? "is" : "are"} currently {memberCount} {memberCount === 1 ? "member" : "members"} assigned to this role.
              </span>
            </div>
          </div>
        )}

        <div className="p-3.5 rounded-xl border border-[#DFE1E7] bg-[#F8FAFB] flex flex-col gap-2 text-xs">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: color + "1A" }}
            >
              <Key size={14} style={{ color }} />
            </div>
            <span className="text-[#1B1B1B] font-semibold text-sm">
              {role.name}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[#777980] text-xs pt-1 border-t border-[#E8E8E9]">
            <Users size={14} className="text-[#777980]" />
            <span>
              {memberCount} {memberCount === 1 ? "member assigned" : "members assigned"}
            </span>
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
            Delete Role
          </Button>
        </div>
      </div>
    </Modal>
  );
}
