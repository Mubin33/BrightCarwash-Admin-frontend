'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Icon } from '@/components/ui/Icon';
import { getDefaultStageIcon } from '@/lib/stage-utils';

interface StageIconProps {
    icon: string | null | undefined;
    stageName: string;
    size?: number;
    className?: string;
    color?: string;
}

export function StageIcon({
    icon,
    stageName,
    size = 18,
    className = '',
    color = '#0098E8'
}: StageIconProps) {
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const isUrl = icon && (icon.startsWith('http://') || icon.startsWith('https://'));
    const defaultIcon = getDefaultStageIcon(stageName);

    // If no icon or error, show default icon
    if (!icon || hasError) {
        return (
            <Icon
                name={defaultIcon}
                width={size}
                height={size}
                color={color}
                className={className}
            />
        );
    }

    // If it's a URL, load it directly
    if (isUrl) {
        return (
            <div className={`relative ${className}`} style={{ width: size, height: size }}>
                {isLoading && (
                    <div
                        className="absolute inset-0 rounded animate-pulse bg-gray-200"
                        style={{ width: size, height: size }}
                    />
                )}
                <img
                    src={icon}
                    alt={`${stageName} icon`}
                    width={size}
                    height={size}
                    className="object-contain"
                    onError={() => {
                        setIsLoading(false);
                        setHasError(true);
                    }}
                    onLoad={() => setIsLoading(false)}
                />
            </div>
        );
    }

    // Fallback: treat as local icon name
    return (
        <Icon
            name={defaultIcon}
            width={size}
            height={size}
            color={color}
            className={className}
        />
    );
}