"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { TeamMember } from "@/types/team";
import { ShieldAlert, ShieldCheck } from "lucide-react";

const roleStyles: Record<string, string> = {
  Admin: "bg-[#FFE6E6] text-[#FF4345]",
  Manager: "bg-[#DCF7EA] text-[#006F1F]",
  Staff: "bg-[#FFF7E6] text-[#FFAF00]",
  "View Only": "bg-[#F8FAFB] text-[#777980]",
};

interface BlockMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: TeamMember | null;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export function BlockMemberModal({
  isOpen,
  onClose,
  member,
  onConfirm,
  isLoading,
}: BlockMemberModalProps) {
  if (!member) return null;

  const isBlockAction = member.status === 1;
  const fullName =
    member.first_name && member.last_name
      ? `${member.first_name} ${member.last_name}`
      : member.name || member.username || "Team Member";

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isLoading) onClose();
      }}
      title={
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isBlockAction ? "bg-[#FEF3F2]" : "bg-[#DCF7EA]"
            }`}
          >
            {isBlockAction ? (
              <ShieldAlert className="text-[#D92D20]" size={20} />
            ) : (
              <ShieldCheck className="text-[#006F1F]" size={20} />
            )}
          </div>
          <div>
            <span className="text-[#1B1B1B] font-inter text-lg font-semibold">
              {isBlockAction ? "Block Team Member" : "Unblock Team Member"}
            </span>
            <p className="text-[#777980] font-inter text-xs">
              {isBlockAction
                ? "Confirm member status restriction"
                : "Restore member access"}
            </p>
          </div>
        </div>
      }
      size="sm"
    >
      <div className="flex flex-col gap-4">
        <p className="text-[#475467] text-sm leading-relaxed">
          {isBlockAction
            ? "Are you sure you want to block this team member? They will immediately lose access to the dashboard until unblocked."
            : "Are you sure you want to unblock this team member? They will regain access to log in and use the dashboard."}
        </p>

        <div className="p-3.5 rounded-xl border border-[#DFE1E7] bg-[#F8FAFB] flex flex-col gap-2 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[#1B1B1B] font-semibold text-sm truncate">
              {fullName}
            </span>
            <span
              className={`inline-flex py-1 px-2.5 justify-center items-center rounded-md text-xs font-medium ${
                roleStyles[member.role] || roleStyles["Staff"]
              }`}
            >
              {member.role}
            </span>
          </div>

          <div className="flex flex-col gap-1 text-[#777980] text-[12px]">
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-[#98A2B3]">Email:</span>
              <span className="text-[#344054] font-medium truncate">
                {member.email}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#98A2B3]">Current Status:</span>
              <span
                className={`font-medium ${
                  member.status === 1 ? "text-[#006F1F]" : "text-[#D92D20]"
                }`}
              >
                {member.status === 1 ? "Active" : "Blocked"}
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
            variant={isBlockAction ? "danger" : "primary"}
            onClick={onConfirm}
            isLoading={isLoading}
            loadingText={isBlockAction ? "Blocking..." : "Unblocking..."}
            className={`px-5 rounded-xl text-white ${
              isBlockAction
                ? "bg-[#D92D20] hover:bg-[#B42318]"
                : "bg-[#0098E8] hover:bg-[#0088D8]"
            }`}
          >
            {isBlockAction ? "Block Member" : "Unblock Member"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
