"use client";

import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ActivityLogHeaderProps {
    onRefresh: () => void;
    isRefreshing?: boolean;
}

export function ActivityLogHeader({ onRefresh, isRefreshing }: ActivityLogHeaderProps) {
    return (
        <div className="flex justify-between items-center self-stretch">
            <h2 className="text-[#0B1220] font-lora text-xl font-bold leading-[100%]">
                Activity Log
            </h2>
            <Button
                onClick={onRefresh}
                isLoading={isRefreshing}
                loadingText="Refreshing..."
                variant="outline"
                className="flex items-center gap-2 w-auto!"
            >
                <RefreshCw size={16} />
                Refresh
            </Button>
        </div>
    );
}