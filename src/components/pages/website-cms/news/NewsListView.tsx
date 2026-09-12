"use client";

import { Icon } from '@/components/ui/Icon';
import type { NewsItem } from '@/types/news';
import type { Category } from '@/types/news';

interface NewsListViewProps {
    items: NewsItem[];
    categories: Category[];
    onEdit: (item: NewsItem) => void;
    onDelete: (id: string) => void;
}

export function NewsListView({ items, categories, onEdit, onDelete }: NewsListViewProps) {
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
        <div className="w-full border border-[#DFE1E7] rounded-lg overflow-hidden bg-white">
            {/* Header */}
            <div className="grid grid-cols-12 gap-3 px-3 py-2 bg-[#F1F1F1] border-b border-[#DFE1E7]">
                <div className="col-span-1 text-[#777980] font-inter text-xs font-medium uppercase">Cover</div>
                <div className="col-span-2 text-[#777980] font-inter text-xs font-medium uppercase">Post Title</div>
                <div className="col-span-2 text-[#777980] font-inter text-xs font-medium uppercase">Category</div>
                <div className="col-span-3 text-[#777980] font-inter text-xs font-medium uppercase">Summary</div>
                <div className="col-span-1 text-[#777980] font-inter text-xs font-medium uppercase">Status</div>
                <div className="col-span-2 text-[#777980] font-inter text-xs font-medium uppercase">Publish Date</div>
                <div className="col-span-1 text-right text-[#777980] font-inter text-xs font-medium uppercase">Actions</div>
            </div>

            {/* Rows */}
            {items.map((item) => (
                <div
                    key={item.id}
                    className="grid grid-cols-12 gap-3 px-3 py-2 border-b border-[#DFE1E7] last:border-b-0 hover:bg-[#F8FAFB] transition-colors cursor-pointer items-center"
                    onClick={() => onEdit(item)}
                >
                    <div className="col-span-1">
                        <div className="w-16 h-10 rounded bg-[#F1F1F1] overflow-hidden flex items-center justify-center">
                            {item.image_url ? (
                                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xs text-[#A5A5AB]">No img</span>
                            )}
                        </div>
                    </div>

                    <div className="col-span-2">
                        <span className="text-[#1B1B1B] font-inter text-base leading-5 line-clamp-1">
                            {item.title}
                        </span>
                    </div>

                    <div className="col-span-2">
                        <span className="inline-flex px-2 py-1 bg-[#F1F1F1] rounded text-[#777980] text-sm font-inter">
                            {getCategoryName(item.category_id)}
                        </span>
                    </div>

                    <div className="col-span-3">
                        <span className="text-[#1B1B1B] font-inter text-base leading-5 line-clamp-1">
                            {item.summary || item.content?.replace(/<[^>]*>/g, '').slice(0, 100)}
                        </span>
                    </div>

                    <div className="col-span-1">
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${item.is_published
                                    ? 'bg-[#DCF7EA] text-[#006F1F]'
                                    : 'bg-[#F1F1F1] text-[#777980]'
                                }`}
                        >
                            {item.is_published ? 'Published' : 'Draft'}
                        </span>
                    </div>

                    <div className="col-span-2">
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