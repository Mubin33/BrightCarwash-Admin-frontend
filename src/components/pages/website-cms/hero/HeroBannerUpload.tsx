"use client";

import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { useRef } from "react";

interface HeroBannerUploadProps {
    isDragging: boolean;
    isLoading: boolean;
    isUploading: boolean;
    displayUrl: string;
    imageError: boolean;
    isPreviewMode: boolean;
    onDrop: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onOpenPicker: () => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onCancel: () => void;
    onReplaceClick: () => void;
    setImageError: (error: boolean) => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export function HeroBannerUpload({
    isDragging,
    isLoading,
    isUploading,
    displayUrl,
    imageError,
    isPreviewMode,
    onDrop,
    onDragOver,
    onDragLeave,
    onOpenPicker,
    onFileChange,
    onCancel,
    onReplaceClick,
    setImageError,
    fileInputRef,
}: HeroBannerUploadProps) {
    const internalInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileInputClick = () => {
        const input = fileInputRef?.current || internalInputRef.current;
        if (input) {
            input.click();
        }
    };

    return (
        <div className='flex flex-col gap-2'>
            <label className='text-[#777980] font-inter text-base font-normal leading-5'>
                Banner Image
            </label>
            <div
                className={`h-64 rounded-lg border-2 border-dashed transition-all overflow-hidden bg-white flex items-center justify-center relative ${isDragging
                        ? 'border-[#0098E8] bg-[#EBF5FF]'
                        : 'border-[#DFE1E7]'
                    } ${!displayUrl ? 'cursor-pointer' : ''}`}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => {
                    if (!displayUrl && !isPreviewMode) {
                        handleFileInputClick();
                    }
                }}
            >
                {isLoading ? (
                    <div className='flex flex-col items-center gap-2'>
                        <div className='w-8 h-8 border-2 border-[#0098E8] border-t-transparent rounded-full animate-spin' />
                        <span className='text-[#777980] text-sm'>
                            {isUploading ? 'Uploading...' : 'Saving...'}
                        </span>
                    </div>
                ) : displayUrl && !imageError ? (
                    <div className='relative w-full h-full'>
                        <Image
                            src={displayUrl}
                            alt='Banner'
                            fill
                            className='object-cover'
                            onError={() => setImageError(true)}
                            onLoad={() => setImageError(false)}
                        />
                        <div
                            className='absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-black/60 transition-all'
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleFileInputClick();
                            }}
                        >
                            <div className='w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm'>
                                <Icon
                                    name='upload'
                                    width={24}
                                    height={24}
                                    color='white'
                                />
                            </div>
                            <span className='text-white text-sm font-medium'>
                                Click to upload new banner
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className='flex flex-col items-center gap-3'>
                        <Icon name='upload' width={48} height={48} color='#A5A5AB' />
                        <div className='text-center'>
                            <p className='text-[#777980] text-base font-medium leading-5'>
                                Upload your banner image here, or drag and drop
                            </p>
                            <p className='text-[#A5A5AB] text-sm font-normal leading-5'>
                                PNG, JPG, WebP up to 10MB
                            </p>
                            {imageError && (
                                <p className='text-[#D14343] text-xs mt-2'>
                                    Unable to load the current image. Please try another
                                    file.
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* File input - always visible but hidden */}
            <input
                ref={(el) => {
                    internalInputRef.current = el;
                    if (fileInputRef) {
                        (fileInputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
                    }
                }}
                type='file'
                accept='image/*'
                onChange={onFileChange}
                className='hidden'
            />

            {isPreviewMode && (
                <div className='flex gap-2 justify-end'>
                    <Button
                        variant='outline'
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onReplaceClick}
                        isLoading={isLoading}
                        loadingText='Uploading...'
                        disabled={isLoading}
                    >
                        <Icon
                            name='upload'
                            width={16}
                            height={16}
                            className='mr-2'
                            color='white'
                        />
                        Replace Banner
                    </Button>
                </div>
            )}
        </div>
    );
}