'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { toast } from 'react-toastify';
import { HeroBackgroundImageGallery } from './HeroBackgroundImageGallery';
import { HeroBackgroundImageDropzone } from './HeroBackgroundImageDropzone';

interface HeroBackgroundImageProps {
    initialImageUrls?: string[];
    onImageUpload: (file: File) => Promise<string>;
    onSave: (data: { backgroundImageUrl: string[] }) => Promise<void>;
    label?: string;
}

export function HeroBackgroundImage({
    initialImageUrls = [],
    onImageUpload,
    onSave,
    label = 'Background Images (Carousel)',
}: HeroBackgroundImageProps) {
    const [imageUrls, setImageUrls] = useState<string[]>(initialImageUrls);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.warning('Please select an image first');
            return;
        }

        setIsUploading(true);
        try {
            const uploadedUrl = await onImageUpload(selectedFile);
            const updatedUrls = [...imageUrls, uploadedUrl];
            setImageUrls(updatedUrls);
            setSelectedFile(null);
            setPreviewUrl(null);

            setIsSaving(true);
            await onSave({ backgroundImageUrl: updatedUrls });
            setIsSaving(false);
            toast.success('Image added successfully');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = async (index: number) => {
        const updatedUrls = imageUrls.filter((_, i) => i !== index);
        setImageUrls(updatedUrls);
        setIsSaving(true);
        await onSave({ backgroundImageUrl: updatedUrls });
        setIsSaving(false);
        toast.success('Image removed');
    };

    const handleReorder = async (fromIndex: number, toIndex: number) => {
        const updatedUrls = [...imageUrls];
        const [moved] = updatedUrls.splice(fromIndex, 1);
        updatedUrls.splice(toIndex, 0, moved);
        setImageUrls(updatedUrls);
        setIsSaving(true);
        await onSave({ backgroundImageUrl: updatedUrls });
        setIsSaving(false);
        toast.success('Order updated');
    };

    const handleCancel = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleOpenPicker = () => {
        if (!isUploading && !isSaving) {
            fileInputRef.current?.click();
        }
    };

    const handleImageError = (index: number) => {
        setImageErrors((prev) => ({ ...prev, [index]: true }));
    };

    const isLoading = isUploading || isSaving;

    return (
        <div className='p-6 bg-[#F8FAFB] rounded-lg border border-[#DFE1E7] flex flex-col gap-4'>
            <div className='flex justify-between items-center'>
                <span className='text-[#1B1B1B] text-xl font-medium leading-6'>
                    {label} ({imageUrls.length})
                </span>
                <div className='flex gap-2'>
                    <Button
                        variant='outline'
                        className='w-auto! flex! py-2.5 px-4 text-[#777980]'
                        onClick={handleOpenPicker}
                        disabled={isLoading}
                    >
                        <Icon name='upload' width={16} height={16} className='mr-2' />
                        Add Image
                    </Button>
                </div>
                <input
                    ref={fileInputRef}
                    type='file'
                    accept='image/*'
                    onChange={handleFileChange}
                    className='hidden'
                />
            </div>

            <HeroBackgroundImageDropzone
                previewUrl={previewUrl}
                selectedFile={selectedFile}
                isLoading={isLoading}
                isDragging={isDragging}
                onFileSelect={handleFileSelect}
                onFileChange={handleFileChange}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onUpload={handleUpload}
                onCancel={handleCancel}
                onOpenPicker={handleOpenPicker}
            />

            <HeroBackgroundImageGallery
                imageUrls={imageUrls}
                isLoading={isLoading}
                onReorder={handleReorder}
                onRemove={handleRemove}
                onImageError={handleImageError}
                imageErrors={imageErrors}
            />

            {imageUrls.length === 0 && !previewUrl && (
                <div className='text-center py-4 text-[#777980] text-sm'>
                    No background images uploaded yet. Add your first image above.
                </div>
            )}

            {isSaving && (
                <div className='flex items-center justify-center gap-2 text-sm text-[#777980]'>
                    <div className='w-4 h-4 border-2 border-[#0098E8] border-t-transparent rounded-full animate-spin' />
                    Saving...
                </div>
            )}
        </div>
    );
}