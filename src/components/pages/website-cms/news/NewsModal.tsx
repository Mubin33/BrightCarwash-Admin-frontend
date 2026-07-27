'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FilterDropdown } from '@/components/ui/FilterDropdown';
import { useCreateNewsMutation, useUpdateNewsMutation } from '@/services/news.api';
import { useGetCategoriesQuery } from '@/services/category.api';
import type { NewsItem } from '@/types/news';
import { toast } from 'react-toastify';

interface NewsModalProps {
    isOpen: boolean;
    onClose: () => void;
    item?: NewsItem | null;
    onSuccess: () => void;
}

export function NewsModal({ isOpen, onClose, item, onSuccess }: NewsModalProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [summary, setSummary] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isPublished, setIsPublished] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: categories = [] } = useGetCategoriesQuery();
    const [createNews] = useCreateNewsMutation();
    const [updateNews] = useUpdateNewsMutation();

    const isEditing = !!item;

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (item) {
            setTitle(item.title);
            setContent(item.content);
            setSummary(item.summary || '');
            setCategoryId(item.category_id);
            setPreview(item.image_url || null);
            setIsPublished(item.is_published);
        } else {
            setTitle('');
            setContent('');
            setSummary('');
            setCategoryId('');
            setFile(null);
            setPreview(null);
            setIsPublished(true);
        }
    }, [item, isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                handleClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => onClose(), 300);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile && droppedFile.type.startsWith('image/')) {
            setFile(droppedFile);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(droppedFile);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.warning('Please enter a title');
            return;
        }
        if (!content.trim()) {
            toast.warning('Please enter content');
            return;
        }
        if (!categoryId) {
            toast.warning('Please select a category');
            return;
        }
        if (!file && !isEditing) {
            toast.warning('Please select an image');
            return;
        }

        setIsSubmitting(true);
        try {
            if (isEditing && item) {
                await updateNews({
                    id: item.id,
                    data: {
                        title: title.trim(),
                        content: content.trim(),
                        summary: summary.trim() || undefined,
                        ...(file ? { image: file } : {}),
                        category_id: categoryId,
                        is_published: isPublished,
                    },
                }).unwrap();
                toast.success('Post updated successfully');
            } else {
                await createNews({
                    title: title.trim(),
                    content: content.trim(),
                    summary: summary.trim() || undefined,
                    image: file!,
                    category_id: categoryId,
                    is_published: isPublished,
                }).unwrap();
                toast.success('Post created successfully');
            }
            onSuccess();
        } catch {
            toast.error(isEditing ? 'Failed to update post' : 'Failed to create post');
        } finally {
            setIsSubmitting(false);
        }
    };

    const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));

    if (!isOpen) return null;

    return (
        <>
            <div
                className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                onClick={handleClose}
            />
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-[560px] bg-white z-50 shadow-xl transition-transform duration-300 ease-out ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
                ref={modalRef}
            >
                <div className="flex flex-col h-full p-6">
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <h2 className="text-[#1D1F2C] font-inter text-2xl font-bold leading-8 tracking-tight">
                                {isEditing ? 'Edit Post' : 'New Blog Post'}
                            </h2>
                            <button
                                onClick={handleClose}
                                className="p-2 rounded-lg hover:bg-[#F8FAFB] transition-colors"
                            >
                                <X size={24} className="text-[#4A4C56]" />
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4 py-4 overflow-y-auto">
                        <div className="flex flex-col gap-2">
                            <label className="text-[#777980] font-inter text-base font-normal leading-5">Cover Image</label>
                            <div
                                className={`relative border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all ${preview ? 'border-[#0098E8] bg-[#F0F8FF]' : 'border-[#DFE1E7] bg-[#F8FAFB] hover:border-[#0098E8] hover:bg-[#F0F8FF]'}`}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {preview ? (
                                    <div className="relative">
                                        <img src={preview} alt="Preview" className="max-h-[180px] mx-auto rounded-lg object-contain" />
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFile(null);
                                                setPreview(null);
                                                if (fileInputRef.current) fileInputRef.current.value = '';
                                            }}
                                            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-[#FFE6E6] transition-colors"
                                        >
                                            <X size={16} className="text-[#FF4345]" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <Upload size={32} className="text-[#777980]" />
                                        <p className="text-[#1B1B1B] font-inter text-base font-medium leading-4">
                                            Drag & drop or click to upload
                                        </p>
                                        <p className="text-[#A5A5AB] font-inter text-sm leading-5">
                                            16:9 recommended · PNG, JPG, WebP
                                        </p>
                                    </div>
                                )}
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1 flex flex-col gap-2">
                                <label className="text-[#777980] font-inter text-base font-normal leading-5">Post Title *</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter post title…"
                                    className="w-full px-4 py-3 bg-white rounded-lg border border-[#DFE1E7] text-[#1B1B1B] placeholder-[#777980] font-inter text-base outline-none focus:border-[#0098E8] transition-all"
                                />
                            </div>
                            <div className="flex-1 flex flex-col gap-2">
                                <label className="text-[#777980] font-inter text-base font-normal leading-5">Category *</label>
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

                        {/* ✅ SUMMARY FIELD - Added here */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#777980] font-inter text-base font-normal leading-5">Summary</label>
                            <textarea
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                placeholder="A brief summary outline…"
                                rows={2}
                                className="w-full px-4 py-3 bg-white rounded-lg border border-[#DFE1E7] text-[#1B1B1B] placeholder-[#777980] font-inter text-base outline-none focus:border-[#0098E8] transition-all resize-none"
                            />
                        </div>

                        <div className="flex flex-col gap-2 flex-1">
                            <label className="text-[#777980] font-inter text-base font-normal leading-5">Content *</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Write your post content here…"
                                rows={6}
                                className="w-full px-4 py-3 bg-white rounded-lg border border-[#DFE1E7] text-[#1B1B1B] placeholder-[#777980] font-inter text-base outline-none focus:border-[#0098E8] transition-all resize-none"
                            />
                        </div>

                        {/* Publish / Draft Toggle */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#777980] font-inter text-base font-normal leading-[130%]">Status</label>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsPublished(false)}
                                    className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${!isPublished ? 'bg-[#F7EBEA] border-[#B23730]' : 'bg-white border-[#ECEFF3] hover:border-[#DFE1E7]'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${!isPublished ? 'border-[#B23730]' : 'border-[#E8E8E9]'}`}>
                                        {!isPublished && <div className="w-2.5 h-2.5 rounded-full bg-[#B23730]" />}
                                    </div>
                                    <span className="text-[#1D1F2C] font-inter text-lg font-normal leading-[132%]">Draft</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsPublished(true)}
                                    className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${isPublished ? 'bg-[#DCF7EA] border-[#006F1F]' : 'bg-white border-[#ECEFF3] hover:border-[#DFE1E7]'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isPublished ? 'border-[#006F1F]' : 'border-[#E8E8E9]'}`}>
                                        {isPublished && <div className="w-2.5 h-2.5 rounded-full bg-[#006F1F]" />}
                                    </div>
                                    <span className="text-[#1D1F2C] font-inter text-lg font-normal leading-[132%]">Published</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-[#DFE1E7]">
                            <Button type="button" variant="outline" onClick={handleClose} className="flex-1 py-3">Cancel</Button>
                            <Button type="submit" isLoading={isSubmitting} loadingText={isEditing ? 'Saving...' : 'Creating...'} className="flex-1 py-3">
                                {isEditing ? 'Update Post' : 'Publish'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}