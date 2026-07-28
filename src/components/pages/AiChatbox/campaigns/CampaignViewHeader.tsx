'use client';

import { X, Pencil, Trash2 } from 'lucide-react';
import type { Campaign } from '@/types/ai-campaign';

interface CampaignViewHeaderProps {
    isEditing: boolean;
    isLoading: boolean;
    campaign: Campaign | null;
    onEdit: () => void;
    onDelete: () => void;
    onClose: () => void;
    isUpdating: boolean;
    isDeleting: boolean;
}

export function CampaignViewHeader({
    isEditing,
    isLoading,
    campaign,
    onEdit,
    onDelete,
    onClose,
    isUpdating,
    isDeleting,
}: CampaignViewHeaderProps) {
    return (
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
            <h2 className="text-neutral-800 text-2xl font-medium font-['Inter'] leading-8">
                {isEditing ? 'Edit Campaign' : 'Campaign Details'}
            </h2>
            <div className="flex items-center gap-2">
                {!isEditing && !isLoading && campaign && (
                    <>
                        <button
                            onClick={onEdit}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            disabled={isUpdating || isDeleting}
                        >
                            <Pencil size={20} className="text-gray-600" />
                        </button>
                        <button
                            onClick={onDelete}
                            className="p-2 hover:bg-red-50 rounded-full transition-colors"
                            disabled={isDeleting || isUpdating}
                        >
                            <Trash2 size={20} className="text-red-500" />
                        </button>
                    </>
                )}
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    disabled={isUpdating || isDeleting}
                >
                    <X size={20} className="text-gray-600" />
                </button>
            </div>
        </div>
    );
}