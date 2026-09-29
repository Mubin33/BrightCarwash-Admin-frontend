"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { Campaign } from "@/types/ai-campaign";
import { CalendarCheck, Trash2 } from "lucide-react";
import Image from "next/image";

interface DeleteCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign | null;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return null;
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

export function DeleteCampaignModal({
  isOpen,
  onClose,
  campaign,
  onConfirm,
  isLoading,
}: DeleteCampaignModalProps) {
  if (!campaign) return null;

  const formattedStart = formatDate(campaign.start_date);
  const formattedEnd = formatDate(campaign.end_date);
  const dateRange =
    formattedStart && formattedEnd
      ? `${formattedStart} to ${formattedEnd}`
      : formattedStart || formattedEnd || "Ongoing";

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
              Delete Campaign
            </span>
            <p className="text-[#777980] font-inter text-xs">
              Confirm campaign deletion
            </p>
          </div>
        </div>
      }
      size="sm"
    >
      <div className="flex flex-col gap-4">
        <p className="text-[#475467] text-sm leading-relaxed">
          Are you sure you want to delete this campaign? This action cannot be undone.
        </p>

        <div className="p-3.5 rounded-xl border border-[#DFE1E7] bg-[#F8FAFB] flex flex-col gap-2.5 text-xs">
          <div className="flex items-start gap-3">
            {campaign.image && (
              <div className="w-12 h-12 rounded-lg relative overflow-hidden bg-gray-100 shrink-0">
                <Image
                  src={campaign.image}
                  alt={campaign.title}
                  unoptimized
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#1B1B1B] font-semibold text-sm truncate">
                  {campaign.title}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md font-medium text-[11px] shrink-0 ${
                    campaign.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {campaign.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              {campaign.description && (
                <p className="text-[#777980] text-[12px] line-clamp-2">
                  {campaign.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[#777980] text-xs pt-2 border-t border-[#E8E8E9]">
            <CalendarCheck size={14} className="text-[#98A2B3] shrink-0" />
            <span className="truncate">{dateRange}</span>
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
            Delete Campaign
          </Button>
        </div>
      </div>
    </Modal>
  );
}
