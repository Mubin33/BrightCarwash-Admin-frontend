"use client";

import { Icon } from '@/components/ui/Icon';
import type { NewsItem } from '@/types/news';
import type { Category } from '@/types/news';
import Image from 'next/image';

interface NewsGridViewProps {
    items: NewsItem[];
    categories: Category[];
    onEdit: (item: NewsItem) => void;
    onDelete: (id: string) => void;
}

export function NewsGridView({ items, categories, onEdit, onDelete }: NewsGridViewProps) {
    const getCategoryName = (categoryId: string) => {
        const cat = categories.find((c) => c.id === categoryId);
        return cat?.name || 'Uncategorized';
    };

    if (items.length === 0) {
        return (
            <div className="flex items-center justify-center py-12 text-[#777980] font-inter text-sm">
                No posts found. Create your first blog post!
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
                <div
                    key={item.id}
                    className="relative bg-[#F8FAFB] rounded-xl border border-[#DFE1E7] overflow-hidden cursor-pointer group"
                    onClick={() => onEdit(item)}
                >
                    <div className="relative h-44 overflow-hidden bg-[#F1F1F1]">
                        {item.image_url ? (
                            <Image
                                src={item.image_url}
                                alt={item.title}
                                fill
                                unoptimized
                                className="object-cover object-top"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#A5A5AB]">
                                No image
                            </div>
                        )}
                        <div className="absolute top-3 left-3">
                            <span
                                className={`px-3 py-1.5 rounded bg-white text-sm font-inter leading-5 ${item.is_published ? 'text-[#006F1F]' : 'text-[#777980]'
                                    }`}
                            >
                                {item.is_published ? 'Published' : 'Draft'}
                            </span>
                        </div>
                        {/* Actions - visible on hover */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(item);
                                }}
                                className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors"
                            >
                                <Icon name="edit" width={16} height={16} color="#1B1B1B" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(item.id);
                                }}
                                className="p-2 bg-white/90 rounded-lg hover:bg-[#FFE6E6] transition-colors"
                            >
                                <Icon name="delete" width={16} height={16} color="#FF4345" />
                            </button>
                        </div>
                    </div>

                    <div className="p-4">
                        <div className="flex items-center gap-2.5 text-sm text-[#A5A5AB] mb-2">
                            <span className="font-medium">{getCategoryName(item.category_id)}</span>
                            <span className="w-1 h-1 rounded-full bg-[#A5A5AB]" />
                            <span className="font-medium">
                                {new Date(item.created_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </span>
                        </div>
                        <h3 className="text-[#1B1B1B] text-xl font-normal font-['Bebas_Neue'] capitalize leading-6">
                            {item.title}
                        </h3>
                    </div>
                </div>
            ))}
        </div>
    );
}