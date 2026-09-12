"use client";

import { useState } from 'react';

export function useHeroBackgroundImage(
    initialImageUrl: string | undefined,
    onImageUpload: (file: File) => Promise<string>,
    onSave: (data: { backgroundImageUrl: string }) => Promise<void>
) {
    const [imageUrl, setImageUrl] = useState<string | undefined>(initialImageUrl);

    const handleImageUpload = async (file: File) => {
        const uploadedUrl = await onImageUpload(file);
        setImageUrl(uploadedUrl);
        await onSave({ backgroundImageUrl: uploadedUrl });
        return uploadedUrl;
    };

    return {
        imageUrl,
        setImageUrl,
        handleImageUpload,
    };
}