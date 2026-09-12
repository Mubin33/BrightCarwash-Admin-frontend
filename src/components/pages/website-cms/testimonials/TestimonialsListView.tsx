"use client";

import { Icon } from '@/components/ui/Icon';
import { RatingStars } from '@/components/ui/RatingStars';
import type { Testimonial } from '@/types/testimonial';

interface TestimonialsListViewProps {
    items: Testimonial[];
    onEdit: (item: Testimonial) => void;
    onDelete: (id: string) => void;
}

export function TestimonialsListView({ items, onEdit, onDelete }: TestimonialsListViewProps) {
    if (!items || items.length === 0) {
        return (
            <div className="flex items-center justify-center py-12 text-[#777980] font-inter text-sm">
                No testimonials found. Add your first testimonial!
            </div>
        );
    }

    return (
        <div className="w-full border border-[#DFE1E7] rounded-lg overflow-hidden bg-white">
            {/* Header */}
            <div className="grid grid-cols-12 gap-3 px-3 py-2 bg-[#F1F1F1] border-b border-[#DFE1E7]">
                <div className="col-span-3 text-[#777980] font-inter text-xs font-medium uppercase">Customer Name</div>
                <div className="col-span-2 text-[#777980] font-inter text-xs font-medium uppercase">Ratings</div>
                <div className="col-span-4 text-[#777980] font-inter text-xs font-medium uppercase">Quote / Review</div>
                <div className="col-span-1 text-[#777980] font-inter text-xs font-medium uppercase">Status</div>
                <div className="col-span-1 text-[#777980] font-inter text-xs font-medium uppercase">Publish Date</div>
                <div className="col-span-1 text-right text-[#777980] font-inter text-xs font-medium uppercase">Actions</div>
            </div>

            {/* Rows */}
            {items.map((item) => (
                <div
                    key={item.id}
                    className="grid grid-cols-12 gap-3 px-3 py-2 border-b border-[#DFE1E7] last:border-b-0 hover:bg-[#F8FAFB] transition-colors cursor-pointer items-center"
                    onClick={() => onEdit(item)}
                >
                    <div className="col-span-3 flex items-center gap-2">
                        {item.avatar ? (
                            <img
                                src={item.avatar}
                                alt={item.name}
                                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-[#E8E8E9] flex items-center justify-center text-[#A5A5AB] text-sm font-medium flex-shrink-0">
                                {item.name?.charAt(0) || '?'}
                            </div>
                        )}
                        <div className="flex flex-col min-w-0">
                            <span className="text-[#777980] text-base font-medium leading-4 truncate">{item.name}</span>
                            <span className="text-[#A5A5AB] text-xs font-normal leading-3 truncate">{item.designation}</span>
                        </div>
                    </div>

                    <div className="col-span-2">
                        <RatingStars rating={item.ratings} size={20} readonly />
                    </div>

                    <div className="col-span-4">
                        <span className="text-[#1B1B1B] text-base font-normal leading-5 line-clamp-1">
                            {item.review_text}
                        </span>
                    </div>

                    <div className="col-span-1">
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${item.is_active
                                    ? 'bg-[#DCF7EA] text-[#006F1F]'
                                    : 'bg-[#F1F1F1] text-[#777980]'
                                }`}
                        >
                            {item.is_active ? 'Published' : 'Draft'}
                        </span>
                    </div>

                    <div className="col-span-1">
                        <span className="text-[#777980] font-inter text-sm">
                            {new Date(item.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </span>
                    </div>

                    <div className="col-span-1 flex items-center justify-end gap-1">
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                            className="p-2 rounded-lg text-[#777980] hover:bg-[#F8FAFB] hover:text-[#0098E8] transition-colors"
                        >
                            <Icon name="edit" width={18} height={18} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                            className="p-2 rounded-lg text-[#777980] hover:bg-[#FFE6E6] hover:text-[#FF4345] transition-colors"
                        >
                            <Icon name="delete" width={18} height={18} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}