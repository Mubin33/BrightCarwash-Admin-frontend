'use client';

import { Icon } from '@/components/ui/Icon';

interface NewsImageUploadProps {
    preview: string | null;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDrop: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onRemove: () => void;
}

export function NewsImageUpload({
    preview,
    onFileChange,
    onDrop,
    onDragOver,
    onRemove,
}: NewsImageUploadProps) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-[#777980] font-inter text-base font-normal leading-5">Cover Image</label>
            <div
                className={`relative border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all ${preview
                        ? 'border-[#0098E8] bg-[#F0F8FF]'
                        : 'border-[#DFE1E7] bg-white hover:border-[#0098E8] hover:bg-[#F0F8FF]'
                    }`}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onClick={() => document.getElementById('coverImage')?.click()}
            >
                {preview ? (
                    <div className="relative">
                        <img
                            src={preview}
                            alt="Preview"
                            className="max-h-[160px] mx-auto rounded-lg object-contain"
                        />
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove();
                            }}
                            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-[#FFE6E6] transition-colors"
                        >
                            <Icon name="close" width={16} height={16} color="#FF4345" />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <Icon name="upload" width={32} height={32} color="#777980" />
                        <p className="text-[#1B1B1B] font-inter text-base font-medium leading-4">
                            Drag & drop or click to upload
                        </p>
                        <p className="text-[#A5A5AB] font-inter text-sm leading-5">
                            16:9 recommended · PNG, JPG, WebP
                        </p>
                    </div>
                )}
                <input
                    id="coverImage"
                    type="file"
                    accept="image/*"
                    onChange={onFileChange}
                    className="hidden"
                />
            </div>
        </div>
    );
}