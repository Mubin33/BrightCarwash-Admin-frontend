"use client";

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { PERMISSIONS } from '@/lib/permissions';

interface HeroHeaderProps {
    onSave: () => void;
    isUpdating: boolean;
}

export function HeroHeader({ onSave, isUpdating }: HeroHeaderProps) {
    return (
        <div className="flex justify-between items-center">
            <h2 className="text-[#1D1F2C] font-inter text-xl font-semibold leading-5">Hero Section</h2>
            <Button
                onClick={onSave}
                isLoading={isUpdating}
                loadingText="Saving..."
                permission={PERMISSIONS.lead.update}
                className="w-auto! flex py-2.5 px-4 items-center gap-2 rounded bg-[#0098E8] text-white font-inter text-sm hover:bg-[#0088D8] transition-colors"
            >
                <Icon name="update" width={16} height={16} color="white" />
                Update
            </Button>
        </div>
    );
}