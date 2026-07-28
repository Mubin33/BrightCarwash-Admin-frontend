'use client';

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

interface KnowledgeHeaderProps {
    onUploadClick: () => void;
}

export function KnowledgeHeader({ onUploadClick }: KnowledgeHeaderProps) {
    return (
        <div className="flex justify-between items-center w-full">
            <h1 className="text-neutral-800 text-2xl font-semibold font-['Inter'] leading-6">
                Knowledge base
            </h1>
            <Button
                variant="primary"
                className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 rounded-sm text-white text-sm font-medium font-['Inter'] leading-4 w-auto!"
                onClick={onUploadClick}
            >
                <Icon name="upload" width={16} height={16} color="white" />
                Upload document
            </Button>
        </div>
    );
}