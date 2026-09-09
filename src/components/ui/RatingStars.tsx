"use client";

import { Star } from "lucide-react";

interface RatingStarsProps {
    rating: number;
    size?: number;
    onChange?: (rating: number) => void;
    readonly?: boolean;
}

export function RatingStars({ rating, size = 24, onChange, readonly = false }: RatingStarsProps) {
    const handleClick = (index: number) => {
        if (!readonly && onChange) {
            onChange(index + 1);
        }
    };

    return (
        <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, index) => (
                <button
                    key={index}
                    type="button"
                    onClick={() => handleClick(index)}
                    disabled={readonly}
                    className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-colors`}
                >
                    <Star
                        size={size}
                        className={`${index < rating
                                ? 'fill-[#FFAF00] text-[#FFAF00]'
                                : 'fill-[#E8E8E9] text-[#E8E8E9]'
                            } transition-colors`}
                    />
                </button>
            ))}
        </div>
    );
}