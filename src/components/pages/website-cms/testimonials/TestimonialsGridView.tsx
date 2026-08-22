"use client";

import { RatingStars } from '@/components/ui/RatingStars';
import { Icon } from '@/components/ui/Icon';
import type { Testimonial } from '@/types/testimonial';

interface TestimonialsGridViewProps {
    items: Testimonial[];
    onEdit: (item: Testimonial) => void;
    onDelete: (id: string) => void;
}

export function TestimonialsGridView({ items, onEdit, onDelete }: TestimonialsGridViewProps) {
    if (!items || items.length === 0) {
        return (
            <div className="flex items-center justify-center py-12 text-[#777980] font-inter text-sm">
                No testimonials found. Add your first testimonial!
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
                <div
                    key={item.id}
                    className="p-4 bg-[#F8FAFB] rounded-lg border border-[#DFE1E7] flex flex-col justify-between gap-14 cursor-pointer hover:shadow-md transition-shadow relative group"
                    onClick={() => onEdit(item)}
                >
                    {/* Delete button - visible on hover */}


                    <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-center">
                            <RatingStars rating={item.ratings} size={24} readonly />
                            <div className='flex gap-3'>
                                <div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(item.id);
                                        }}
                                        className="px-3 py-1.5 bg-black/5 rounded-lg hover:bg-[#FFE6E6] transition-colors opacity-0 group-hover:opacity-100 z-10"
                                    >
                                        <Icon name="delete" width={16} height={16} color="#FF4345" />
                                    </button>
                                </div>
                                <span
                                    className={`px-3 py-1.5 rounded bg-white text-sm font-inter leading-5 ${item.is_active
                                        ? 'text-[#006F1F]'
                                        : 'text-[#777980]'
                                        }`}
                                >
                                    {item.is_active ? 'Published' : 'Draft'}
                                </span>
                            </div>

                        </div>
                        <p className="text-[#1B1B1B] text-base font-medium leading-6 line-clamp-3">
                            {item.review_text}
                        </p>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="flex-1 flex flex-col gap-3">
                            <span className="text-[#777980] text-base font-medium leading-4">
                                {item.name}
                            </span>
                            <span className="text-[#A5A5AB] text-sm font-normal leading-4">
                                {item.designation}
                            </span>
                        </div>
                        {item.avatar ? (
                            <img
                                src={item.avatar}
                                alt={item.name}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-[#E8E8E9] flex items-center justify-center text-[#A5A5AB] text-sm font-medium">
                                {item.name?.charAt(0) || '?'}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}