'use client';

import Image from 'next/image';
import { X } from 'lucide-react';
import { getFullImageUrl } from '@/lib/image-url';
import { useEffect } from 'react';

interface HeroBackgroundImageItemProps {
    url: string;
    index: number;
    isDragging: boolean;
    onRemove: (index: number) => void;
    onError: (index: number) => void;
    hasError: boolean;
    isLoading?: boolean;
    dragHandleProps?: any;
}

export function HeroBackgroundImageItem({
    url,
    index,
    isDragging,
    onRemove,
    onError,
    hasError,
    isLoading = false,
    dragHandleProps,
}: HeroBackgroundImageItemProps) {
    const fullUrl = getFullImageUrl(url);

    // DEBUG: Log the URLs
    useEffect(() => {
        console.log(`🔍 Image ${index} - Original URL:`, url);
        console.log(`🔍 Image ${index} - Full URL:`, fullUrl);
        console.log(`🔍 Image ${index} - URL starts with http:`, fullUrl.startsWith('http'));
    }, [url, fullUrl, index]);

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        console.log(`🗑️ Removing image ${index}`);
        onRemove(index);
    };

    const handleError = () => {
        console.error(`❌ Failed to load image ${index}:`, fullUrl);
        onError(index);
    };

    const handleLoad = () => {
        console.log(`✅ Image ${index} loaded successfully:`, fullUrl);
    };

    return (
        <div
            className={`relative group aspect-video rounded-lg overflow-hidden border border-[#DFE1E7] bg-[#F1F1F1] transition-all duration-200 ${isDragging ? 'opacity-50 scale-95 shadow-lg' : 'hover:shadow-md'
                }`}
            {...dragHandleProps}
        >
            {!hasError ? (
                <Image
                    src={fullUrl}
                    alt={`Background ${index + 1}`}
                    fill
                    className='object-cover'
                    sizes='(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw'
                    unoptimized
                    onError={handleError}
                    onLoad={handleLoad}
                />
            ) : (
                <div className='w-full h-full flex items-center justify-center text-[#777980] text-xs p-2 text-center'>
                    <div>
                        <p>Failed to load</p>
                        <p className='text-[10px] mt-1 break-all'>{fullUrl}</p>
                    </div>
                </div>
            )}

            {/* Order number badge */}
            <div className='absolute top-2 left-2 bg-black/60 text-white text-xs font-medium px-2 py-1 rounded z-10'>
                #{index + 1}
            </div>

            {/* Drag handle indicator */}
            <div className='absolute top-2 left-1/2 -translate-x-1/2 bg-black/40 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10'>
                Drag to reorder
            </div>

            {/* Remove button */}
            <button
                onClick={handleRemove}
                className='absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed z-10'
                disabled={isLoading}
                title='Remove image'
            >
                <X size={16} />
            </button>
        </div>
    );
}