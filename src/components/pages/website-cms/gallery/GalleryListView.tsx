"use client";

import Image from 'next/image';
import { Icon } from '@/components/ui/Icon';
import type { GalleryItem } from '@/types/gallery';

interface GalleryListViewProps {
    items: GalleryItem[];
    onEdit: (item: GalleryItem) => void;
    onDelete: (id: string) => void;
}

export function GalleryListView({ items, onEdit, onDelete }: GalleryListViewProps) {
    if (items.length === 0) {
        return (
            <div className="flex items-center justify-center py-12 text-[#777980] font-inter text-sm">
                No gallery items found. Add your first image!
            </div>
        );
    }

    return (
        <div className="w-full border border-[#E8E8E9] rounded-lg overflow-hidden bg-white">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-[#F1F1F1] border-b border-[#E8E8E9]">
                <div className="col-span-1 text-[#777980] font-inter text-xs font-medium uppercase tracking-wider">
                    Photo
                </div>
                <div className="col-span-3 text-[#777980] font-inter text-xs font-medium uppercase tracking-wider">
                    Caption
                </div>
                <div className="col-span-3 text-[#777980] font-inter text-xs font-medium uppercase tracking-wider">
                    Status
                </div>
                <div className="col-span-3 text-[#777980] font-inter text-xs font-medium uppercase tracking-wider">
                    Publish Date
                </div>
                <div className="col-span-2 text-right text-[#777980] font-inter text-xs font-medium uppercase tracking-wider">
                    Actions
                </div>
            </div>

            {/* Table Rows */}
            {items.map((item) => (
                <div
                    key={item.id}
                    className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-[#E8E8E9] last:border-b-0 hover:bg-[#F8FAFB] transition-colors cursor-pointer items-center"
                    onClick={() => onEdit(item)}
                >
                    {/* Photo */}
                    <div className="col-span-1 ">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F1F1F1]">
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover "
                            />
                        </div>
                    </div>

                    {/* Caption */}
                    <div className="col-span-3">
                        <span className="text-[#1B1B1B] font-inter text-sm truncate block">
                            {item.name}
                        </span>
                    </div>

                    {/* Status */}
                    <div className="col-span-3 ">
                        <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium  ${item.is_published
                                ? 'bg-[#DCF7EA] text-[#006F1F]'
                                : 'bg-[#F1F1F1] text-[#777980]'
                                }`}
                        >
                            {item.is_published ? 'Published' : 'Draft'}
                        </span>
                    </div>

                    {/* Publish Date */}
                    <div className="col-span-3">
                        <span className="text-[#777980] font-inter text-sm">
                            {new Date(item.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex items-center justify-end gap-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(item);
                            }}
                            className="p-2 rounded-lg text-[#777980] hover:bg-[#F8FAFB] hover:text-[#0098E8] transition-colors"
                            aria-label="Edit"
                        >
                            <Icon name="edit" width={18} height={18} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(item.id);
                            }}
                            className="p-2 rounded-lg text-[#777980] hover:bg-[#FFE6E6] hover:text-[#FF4345] transition-colors"
                            aria-label="Delete"
                        >
                            <Icon name="delete" width={18} height={18} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}