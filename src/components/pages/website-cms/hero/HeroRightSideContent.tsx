'use client';

import { useState, useRef, useEffect } from 'react';
import { Icon } from '@/components/ui/Icon';
import { HeroStatusSelector } from './HeroStatusSelector';
import { HeroBannerUpload } from './HeroBannerUpload';
import { HeroTextAlignment } from './HeroTextAlignment';
import { getFullImageUrl } from '@/lib/image-url';
import { toast } from 'react-toastify';

interface HeroRightSideContentProps {
    status: 'form' | 'banner' | 'hidden';
    onStatusChange: (status: 'form' | 'banner' | 'hidden') => void;
    bannerImageUrl?: string;
    onBannerImageUpload: (file: File) => Promise<string>;
    onBannerImageSave: (data: { bannerImageUrl: string }) => Promise<void>;
    isUploading?: boolean;
    textAlignment?: 'left' | 'center' | 'right';
    onTextAlignmentChange?: (alignment: 'left' | 'center' | 'right') => void;
}

export function HeroRightSideContent({
    status,
    onStatusChange,
    bannerImageUrl,
    onBannerImageUpload,
    onBannerImageSave,
    isUploading = false,
    textAlignment = 'left',
    onTextAlignmentChange,
}: HeroRightSideContentProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | undefined>(bannerImageUrl);
    const [isSaving, setIsSaving] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [imageError, setImageError] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (bannerImageUrl !== imageUrl) {
            setImageUrl(bannerImageUrl);
            setImageError(false);
        }
    }, [bannerImageUrl]);

    const handleFileSelect = (file: File) => {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setPreviewUrl(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
        e.target.value = '';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            handleFileSelect(file);
        } else {
            toast.warning('Please drop an image file');
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleReplaceClick = async () => {
        if (!selectedFile) {
            toast.warning('Please select an image first');
            return;
        }

        try {
            const uploadedUrl = await onBannerImageUpload(selectedFile);
            setImageUrl(uploadedUrl);
            setSelectedFile(null);
            setPreviewUrl(null);
            setImageError(false);

            setIsSaving(true);
            await onBannerImageSave({ bannerImageUrl: uploadedUrl });
            setIsSaving(false);
            toast.success('Banner image updated successfully');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to update banner image');
        }
    };

    const handleCancel = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleOpenPicker = () => {
        if (!isUploading && !isSaving && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleAlignmentChange = (alignment: 'left' | 'center' | 'right') => {
        onTextAlignmentChange?.(alignment);
    };

    const fullUrl = imageUrl ? getFullImageUrl(imageUrl) : '';
    const displayUrl = previewUrl || fullUrl;
    const isPreviewMode = !!previewUrl;
    const isLoading = isUploading || isSaving;

    return (
        <div className='p-6 bg-[#F8FAFB] rounded-lg border border-[#DFE1E7] flex flex-col gap-4'>
            <span className='text-[#1B1B1B] text-xl font-medium leading-6'>
                Right Side Content
            </span>
            <HeroStatusSelector status={status} onChange={onStatusChange} />

            {status === 'form' && (
                <div className='p-4 bg-[#EBF5FF] rounded-lg border border-[#0098E8] flex flex-col gap-2'>
                    <span className='text-[#1B1B1B] text-lg font-medium leading-4'>
                        Booking Form active
                    </span>
                    <p className='text-[#777980] text-sm font-normal leading-6'>
                        Shows vehicle select, name, date, phone, and email fields. The
                        primary button label is used as the submit button.
                    </p>
                </div>
            )}

            {status === 'banner' && (
                <HeroBannerUpload
                    isDragging={isDragging}
                    isLoading={isLoading}
                    isUploading={isUploading}
                    displayUrl={displayUrl}
                    imageError={imageError}
                    isPreviewMode={isPreviewMode}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onOpenPicker={handleOpenPicker}
                    onFileChange={handleFileChange}
                    onCancel={handleCancel}
                    onReplaceClick={handleReplaceClick}
                    setImageError={setImageError}
                    fileInputRef={fileInputRef}
                />
            )}

            {status === 'hidden' && (
                <>
                    <div className='p-4 bg-[#F8FAFB] rounded-lg border border-[#DFE1E7] flex flex-col items-center justify-center gap-2 py-8'>
                        <Icon name='eye-off' width={32} height={32} color='#A5A5AB' />
                        <p className='text-[#777980] font-inter text-sm'>
                            Form and banner are hidden. Only text content is visible.
                        </p>
                    </div>
                    <HeroTextAlignment
                        textAlignment={textAlignment}
                        onAlignmentChange={handleAlignmentChange}
                    />
                </>
            )}
        </div>
    );
}