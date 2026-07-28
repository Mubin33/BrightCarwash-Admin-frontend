'use client';

import { Button } from '@/components/ui/Button';
import { Save } from 'lucide-react';

interface CampaignViewActionsProps {
    onCancel: () => void;
    onSave: () => void;
    isUpdating: boolean;
}

export function CampaignViewActions({
    onCancel,
    onSave,
    isUpdating,
}: CampaignViewActionsProps) {
    return (
        <div className="flex justify-end items-center gap-3 pt-4 border-t border-zinc-200">
            <Button
                variant="outline"
                className="flex-1 px-5 py-3 rounded-sm outline outline-1 outline-offset-[-1px] outline-zinc-200 text-neutral-600 text-base font-medium font-['Inter'] leading-5"
                onClick={onCancel}
                disabled={isUpdating}
            >
                Cancel
            </Button>
            <Button
                variant="primary"
                className="flex-1 px-5 py-3 bg-sky-500 rounded-sm text-white text-base font-medium font-['Inter'] leading-5"
                onClick={onSave}
                isLoading={isUpdating}
                loadingText="Saving..."
                disabled={isUpdating}
            >
                <Save size={16} className="mr-2" />
                Save Changes
            </Button>
        </div>
    );
}