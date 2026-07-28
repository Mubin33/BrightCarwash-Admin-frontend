'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

interface CampaignViewPhotoProps {
    previewUrl: string | null;
    isEditing: boolean;
    isUpdating: boolean;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
}

export function CampaignViewPhoto({
    previewUrl,
    isEditing,
    isUpdating,
    onFileChange,
    fileInputRef,
}: CampaignViewPhotoProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleUploadClick = () => {
        if (inputRef.current) {
            inputRef.current.click();
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="text-zinc-500 text-base font-normal font-['Inter'] leading-5">
                Campaign Photo
            </div>
            <div className="flex items-start gap-4">
                <div className="p-5 bg-gray-50 rounded-lg outline outline-2 outline-offset-[-2px] outline-zinc-200 flex justify-start items-center">
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-16 h-16 object-cover rounded"
                        />
                    ) : (
                        <Icon name="image" width={32} height={32} />
                    )}
                </div>
                {isEditing && (
                    <div className="flex-1 flex flex-col gap-3">
                        <Button
                            variant="outline"
                            className="px-4 py-2.5 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 text-neutral-800 text-sm font-medium font-['Inter'] leading-4"
                            onClick={handleUploadClick}
                            disabled={isUpdating}
                        >
                            Upload Photo
                        </Button>
                        <input
                            ref={(el) => {
                                inputRef.current = el;
                                fileInputRef.current = el;
                            }}
                            type="file"
                            accept="image/png,image/jpeg"
                            onChange={onFileChange}
                            className="hidden"
                            disabled={isUpdating}
                        />
                        <div className="text-neutral-600 text-base font-normal font-['Inter'] leading-5">
                            PNG, JPG up to 5MB. Circular crop applied.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}