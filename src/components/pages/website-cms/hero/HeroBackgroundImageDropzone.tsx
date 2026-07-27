'use client';

import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { useRef } from 'react';

interface HeroBackgroundImageDropzoneProps {
    previewUrl: string | null;
    selectedFile: File | null;
    isLoading: boolean;
    isDragging: boolean;
    onFileSelect: (file: File) => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDrop: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onUpload: () => void;
    onCancel: () => void;
    onOpenPicker: () => void;
}

export function HeroBackgroundImageDropzone({
    previewUrl,
    selectedFile,
    isLoading,
    isDragging,
    onFileSelect,
    onFileChange,
    onDrop,
    onDragOver,
    onDragLeave,
    onUpload,
    onCancel,
    onOpenPicker,
}: HeroBackgroundImageDropzoneProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <>
            <div
                className={`h-40 rounded-lg border-2 border-dashed transition-all overflow-hidden bg-[#F1F1F1] flex items-center justify-center relative ${isDragging ? 'border-[#0098E8] bg-[#EBF5FF]' : 'border-[#DFE1E7]'
                    } ${!previewUrl ? 'cursor-pointer' : ''}`}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => {
                    if (!previewUrl && !selectedFile) {
                        onOpenPicker();
                    }
                }}
            >
                {previewUrl ? (
                    <div className='relative w-full h-full'>
                        <img
                            src={previewUrl}
                            alt='Preview'
                            className='w-full h-full object-cover'
                        />
                        <div className='absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2'>
                            <p className='text-white text-sm font-medium'>
                                Ready to upload: {selectedFile?.name}
                            </p>
                            <p className='text-white/60 text-xs'>
                                {selectedFile?.size
                                    ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                                    : ''}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className='flex flex-col items-center gap-3'>
                        <Icon name='upload' width={48} height={48} color='#A5A5AB' />
                        <div className='text-center'>
                            <p className='text-[#777980] text-sm font-medium'>
                                Drop your image here, or click to browse
                            </p>
                            <p className='text-[#A5A5AB] text-xs mt-1'>
                                PNG, JPG, WebP up to 10MB
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                onChange={onFileChange}
                className='hidden'
            />

            {selectedFile && previewUrl && (
                <div className='flex justify-end gap-2'>
                    <Button
                        variant='outline'
                        className='w-auto! py-2.5 px-4 text-[#777980]'
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        className='w-auto! py-2.5 px-4 bg-[#0098E8] text-white'
                        onClick={onUpload}
                        isLoading={isLoading}
                        loadingText='Uploading...'
                        disabled={isLoading}
                    >
                        <Icon name='upload' width={16} height={16} className='mr-2' color='white' />
                        Add Image
                    </Button>
                </div>
            )}
        </>
    );
}