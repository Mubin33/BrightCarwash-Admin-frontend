'use client';

import { FilterDropdown } from '@/components/ui/FilterDropdown';
import { BlogEditor } from '@/components/pages/website-cms/news/BlogEditor';
import { NewsImageUpload } from './NewsImageUpload';

interface NewsFormFieldsProps {
    title: string;
    setTitle: (value: string) => void;
    content: string;
    setContent: (value: string) => void;
    summary: string;
    setSummary: (value: string) => void;
    categoryId: string;
    setCategoryId: (value: string) => void;
    categories: { id: string; name: string }[];
    preview: string | null;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDrop: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onImageRemove: () => void;
}

export function NewsFormFields({
    title,
    setTitle,
    content,
    setContent,
    summary,
    setSummary,
    categoryId,
    setCategoryId,
    categories,
    preview,
    onFileChange,
    onDrop,
    onDragOver,
    onImageRemove,
}: NewsFormFieldsProps) {
    const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));

    return (
        <div className="p-6 bg-[#F8FAFB] rounded-lg border border-[#DFE1E7] flex flex-col gap-4">
            {/* Cover Image */}
            <NewsImageUpload
                preview={preview}
                onFileChange={onFileChange}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onRemove={onImageRemove}
            />

            {/* Title & Category */}
            <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-2">
                    <label className="text-[#777980] font-inter text-base font-normal leading-5">
                        Post Title *
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter post title…"
                        className="w-full px-4 py-3 bg-white rounded-lg border border-[#DFE1E7] text-[#1B1B1B] placeholder-[#777980] font-inter text-base outline-none focus:border-[#0098E8] transition-all"
                    />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                    <label className="text-[#777980] font-inter text-base font-normal leading-5">
                        Category *
                    </label>
                    <FilterDropdown
                        label="Select category"
                        options={categoryOptions}
                        value={categoryId}
                        onChange={setCategoryId}
                        fullWidth
                        scrollable
                    />
                </div>
            </div>

            {/* ✅ Summary Field - NEW */}
            <div className="flex flex-col gap-2">
                <label className="text-[#777980] font-inter text-base font-normal leading-5">
                    Summary
                </label>
                <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="A brief summary outline…"
                    rows={2}
                    className="w-full px-4 py-3 bg-white rounded-lg border border-[#DFE1E7] text-[#1B1B1B] placeholder-[#777980] font-inter text-base outline-none focus:border-[#0098E8] transition-all resize-none"
                />
            </div>

            {/* Content */}
            <div className="flex flex-col gap-2">
                <label className="text-[#777980] font-inter text-base font-normal leading-5">
                    Content *
                </label>
                <BlogEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Write your post content here…"
                />
            </div>
        </div>
    );
}