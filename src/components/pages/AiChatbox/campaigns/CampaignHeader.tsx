'use client';

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

interface CampaignHeaderProps {
    onNewCampaignClick: () => void;
}

export function CampaignHeader({ onNewCampaignClick }: CampaignHeaderProps) {
    return (
        <div className="flex justify-between items-center w-full">
            <h1 className="text-neutral-800 text-2xl font-semibold font-['Inter'] leading-6">
                AI Campaigns
            </h1>
            <Button
                variant="primary"
                className="w-auto! flex items-center gap-2 px-4 py-2.5 bg-sky-500 rounded-sm text-white text-sm font-medium font-['Inter'] leading-4"
                onClick={onNewCampaignClick}
            >
                <Icon name="plus" width={16} height={16} color="white" />
                New campaign
            </Button>
        </div>
    );
}