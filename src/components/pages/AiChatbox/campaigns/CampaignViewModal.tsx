"use client";

import type { Campaign } from "@/types/ai-campaign";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  CampaignViewActions,
  CampaignViewDates,
  CampaignViewHeader,
  CampaignViewStatus,
} from ".";
import { CampaignViewCreatedAt } from "./CampaignViewCreatedAt";
import { CampaignViewDescription } from "./CampaignViewDescription";
import { CampaignViewLoading } from "./CampaignViewLoading";
import { CampaignViewName } from "./CampaignViewName";
import { CampaignViewPhoto } from "./CampaignViewPhoto";

interface CampaignViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign | null;
  isLoading: boolean;
  onUpdate: (
    id: number,
    data: {
      title: string;
      description: string;
      image?: File | null;
      is_active: boolean;
      start_date?: string;
      end_date?: string;
    },
  ) => Promise<void>;
  onDelete: (id: number) => void | Promise<void>;
  isUpdating: boolean;
  isDeleting: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  canChangeStatus?: boolean;
}

export function CampaignViewModal({
  isOpen,
  onClose,
  campaign,
  isLoading,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
  canUpdate = true,
  canDelete = true,
  canChangeStatus = true,
}: CampaignViewModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const [prevCampaign, setPrevCampaign] = useState(campaign);

  if (campaign !== prevCampaign) {
    setPrevCampaign(campaign);
    if (campaign) {
      setTitle(campaign.title);
      setDescription(campaign.description);
      setIsActive(campaign.is_active);
      setStartDate(campaign.start_date || "");
      setEndDate(campaign.end_date || "");
      setPreviewUrl(campaign.image || null);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleSave = async () => {
    if (!canUpdate) {
      toast.error("You do not have permission to update campaigns");
      return;
    }
    if (!title.trim()) {
      toast.error("Please enter a campaign name");
      return;
    }
    if (!description.trim()) {
      toast.error("Please enter a campaign description");
      return;
    }

    if (!campaign) return;

    await onUpdate(campaign.id, {
      title: title.trim(),
      description: description.trim(),
      image: selectedFile,
      is_active: canChangeStatus ? isActive : campaign.is_active,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    });

    setIsEditing(false);
    setSelectedFile(null);
  };

  const handleDelete = () => {
    if (!canDelete) {
      toast.error("You do not have permission to delete campaigns");
      return;
    }
    if (!campaign) return;
    onDelete(campaign.id);
  };

  const handleClose = () => {
    setIsEditing(false);
    setSelectedFile(null);
    if (campaign) {
      setTitle(campaign.title);
      setDescription(campaign.description);
      setIsActive(campaign.is_active);
      setStartDate(campaign.start_date || "");
      setEndDate(campaign.end_date || "");
      setPreviewUrl(campaign.image || null);
    }
    onClose();
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedFile(null);
    if (campaign) {
      setTitle(campaign.title);
      setDescription(campaign.description);
      setIsActive(campaign.is_active);
      setStartDate(campaign.start_date || "");
      setEndDate(campaign.end_date || "");
      setPreviewUrl(campaign.image || null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-[520px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out adm-slide-in-right overflow-y-auto">
        {/* Header */}
        <CampaignViewHeader
          isEditing={isEditing}
          isLoading={isLoading}
          campaign={campaign}
          canUpdate={canUpdate}
          canDelete={canDelete}
          onEdit={() => setIsEditing(true)}
          onDelete={handleDelete}
          onClose={handleClose}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
        />

        <div className="p-6">
          {isLoading ? (
            <CampaignViewLoading />
          ) : campaign ? (
            <div className="flex flex-col gap-6">
              <CampaignViewPhoto
                previewUrl={previewUrl}
                isEditing={isEditing}
                isUpdating={isUpdating}
                onFileChange={handleFileChange}
                fileInputRef={fileInputRef}
              />

              <CampaignViewName
                title={title}
                isEditing={isEditing}
                isUpdating={isUpdating}
                onTitleChange={setTitle}
              />

              <CampaignViewDescription
                description={description}
                isEditing={isEditing}
                isUpdating={isUpdating}
                onDescriptionChange={setDescription}
              />

              <CampaignViewDates
                startDate={startDate}
                endDate={endDate}
                isEditing={isEditing}
                isUpdating={isUpdating}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
              />

              <CampaignViewStatus
                isActive={isActive}
                isEditing={isEditing}
                isUpdating={isUpdating}
                canChangeStatus={canChangeStatus}
                onStatusChange={setIsActive}
              />

              {!isEditing && (
                <CampaignViewCreatedAt createdAt={campaign.created_at} />
              )}

              {isEditing && (
                <CampaignViewActions
                  onCancel={handleCancelEdit}
                  onSave={handleSave}
                  isUpdating={isUpdating}
                />
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Campaign not found
            </div>
          )}
        </div>
      </div>
    </>
  );
}