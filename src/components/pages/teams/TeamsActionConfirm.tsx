"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { TeamMember } from "@/types/team";
import {
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  UserMinus,
  UserX,
} from "lucide-react";
import { useState, type ReactNode } from "react";

export type TeamsActionType = "revoke" | "block" | "unblock" | "custom";

export interface TeamsActionConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: TeamsActionType;
  member: TeamMember | null;
  onConfirm: (member: TeamMember) => Promise<void> | void;
  isLoading?: boolean;

  // Optional dynamic overrides
  title?: string;
  subtitle?: string;
  description?: ReactNode;
  noticeTitle?: string;
  noticeDescription?: ReactNode;
  confirmText?: string;
  loadingText?: string;
  confirmVariant?: "primary" | "secondary" | "outline" | "danger";
  confirmButtonClassName?: string;
  icon?: ReactNode;
  iconBgClassName?: string;
}

export function TeamsActionConfirm({
  isOpen,
  onClose,
  actionType,
  member,
  onConfirm,
  isLoading,
  title,
  subtitle,
  description,
  noticeTitle,
  noticeDescription,
  confirmText,
  loadingText,
  confirmVariant,
  confirmButtonClassName,
  icon,
  iconBgClassName,
}: TeamsActionConfirmProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const isSubmitting = isLoading ?? internalLoading;

  if (!member) return null;

  const memberName =
    member.first_name && member.last_name
      ? `${member.first_name} ${member.last_name}`
      : member.name || member.username || member.email || "this member";

  const getActionConfig = () => {
    switch (actionType) {
      case "revoke":
        return {
          icon: <UserX className="text-[#D92D20]" size={20} />,
          iconBg: "bg-[#FEF3F2]",
          title: "Revoke Invitation",
          subtitle: "Confirm revoking member invitation",
          description: (
            <>
              Are you sure you want to revoke the invitation for{" "}
              <strong>&quot;{memberName}&quot;</strong>? This action cannot be
              undone.
            </>
          ),
          bannerBg: "bg-[#FFF4F3]",
          bannerBorder: "border-[#FECDCA]",
          bannerIcon: (
            <AlertTriangle
              size={18}
              className="text-[#D92D20] shrink-0 mt-0.5"
            />
          ),
          bannerTextColor: "text-[#B42318]",
          noticeTitle: "Notice regarding invitation:",
          noticeDescription:
            "Revoking this invitation will immediately expire the invite link. The recipient will not be able to join the team using the previously sent invitation.",
          buttonVariant: "danger" as const,
          buttonClass: "bg-[#D92D20] hover:bg-[#B42318]",
          confirmText: "Revoke Invite",
          loadingText: "Revoking...",
        };

      case "block":
        return {
          icon: <UserMinus className="text-[#D92D20]" size={20} />,
          iconBg: "bg-[#FEF3F2]",
          title: "Block Member",
          subtitle: "Confirm blocking member access",
          description: (
            <>
              Are you sure you want to block{" "}
              <strong>&quot;{memberName}&quot;</strong>? They will temporarily
              lose access to the system.
            </>
          ),
          bannerBg: "bg-[#FFF4F3]",
          bannerBorder: "border-[#FECDCA]",
          bannerIcon: (
            <AlertTriangle
              size={18}
              className="text-[#D92D20] shrink-0 mt-0.5"
            />
          ),
          bannerTextColor: "text-[#B42318]",
          noticeTitle: "Notice regarding member access:",
          noticeDescription:
            "Blocking this member will immediately suspend their dashboard access. They will be prevented from signing in until unblocked.",
          buttonVariant: "danger" as const,
          buttonClass: "bg-[#D92D20] hover:bg-[#B42318]",
          confirmText: "Block Member",
          loadingText: "Blocking...",
        };

      case "unblock":
        return {
          icon: <UserCheck className="text-[#027A48]" size={20} />,
          iconBg: "bg-[#EDFDF5]",
          title: "Unblock Member",
          subtitle: "Confirm restoring member access",
          description: (
            <>
              Are you sure you want to unblock{" "}
              <strong>&quot;{memberName}&quot;</strong>? Their access to the
              system will be restored.
            </>
          ),
          bannerBg: "bg-[#EDFDF5]",
          bannerBorder: "border-[#ABEFC6]",
          bannerIcon: (
            <CheckCircle2
              size={18}
              className="text-[#027A48] shrink-0 mt-0.5"
            />
          ),
          bannerTextColor: "text-[#067647]",
          noticeTitle: "Notice regarding member access:",
          noticeDescription:
            "Unblocking this member will reactivate their account, restoring all permissions and dashboard access.",
          buttonVariant: "primary" as const,
          buttonClass: "bg-[#079455] hover:bg-[#067647]",
          confirmText: "Unblock Member",
          loadingText: "Unblocking...",
        };

      default:
        return {
          icon: <AlertTriangle className="text-[#D92D20]" size={20} />,
          iconBg: "bg-[#FEF3F2]",
          title: "Confirm Action",
          subtitle: "Please confirm your action",
          description: (
            <>
              Are you sure you want to proceed with this action for{" "}
              <strong>&quot;{memberName}&quot;</strong>?
            </>
          ),
          bannerBg: "bg-[#FFF4F3]",
          bannerBorder: "border-[#FECDCA]",
          bannerIcon: (
            <AlertTriangle
              size={18}
              className="text-[#D92D20] shrink-0 mt-0.5"
            />
          ),
          bannerTextColor: "text-[#B42318]",
          noticeTitle: "Notice regarding this action:",
          noticeDescription:
            "Please confirm that you want to apply these changes.",
          buttonVariant: "danger" as const,
          buttonClass: "bg-[#D92D20] hover:bg-[#B42318]",
          confirmText: "Confirm",
          loadingText: "Processing...",
        };
    }
  };

  const config = getActionConfig();

  const handleConfirm = async () => {
    if (!member) return;
    setInternalLoading(true);
    try {
      await onConfirm(member);
      onClose();
    } catch (err) {
      console.error("Action confirmation failed:", err);
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isSubmitting) onClose();
      }}
      title={
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl ${
              iconBgClassName || config.iconBg
            } flex items-center justify-center shrink-0`}
          >
            {icon || config.icon}
          </div>
          <div>
            <span className="text-[#1B1B1B] font-inter text-lg font-semibold block">
              {title || config.title}
            </span>
            <p className="text-[#777980] font-inter text-xs">
              {subtitle || config.subtitle}
            </p>
          </div>
        </div>
      }
      size="md"
    >
      <div className="flex flex-col gap-4">
        <p className="text-[#475467] text-sm leading-relaxed">
          {description || config.description}
        </p>

        {/* Warning banner */}
        <div
          className={`p-3.5 rounded-xl ${config.bannerBg} border ${config.bannerBorder} flex items-start gap-2.5`}
        >
          {config.bannerIcon}
          <div
            className={`flex flex-col gap-0.5 text-xs ${config.bannerTextColor} leading-relaxed`}
          >
            <span className="font-semibold">
              {noticeTitle || config.noticeTitle}
            </span>
            <span>{noticeDescription || config.noticeDescription}</span>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex gap-3 justify-end pt-3 border-t border-[#E8E8E9]">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 rounded-xl w-auto!"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={confirmVariant || config.buttonVariant}
            onClick={handleConfirm}
            isLoading={isSubmitting}
            loadingText={loadingText || config.loadingText}
            className={`px-5 rounded-xl text-white w-auto! ${
              confirmButtonClassName || config.buttonClass
            }`}
          >
            {confirmText || config.confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
