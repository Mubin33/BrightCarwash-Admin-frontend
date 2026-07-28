'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { NewsFormFields } from './NewsFormFields';
import { useCreateNewsMutation } from '@/services/news.api';
import { useGetCategoriesQuery } from '@/services/category.api';
import { toast } from 'react-toastify';

export function CreateNewsForm() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [summary, setSummary] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPublished, setIsPublished] = useState(true);

    const { data: categories = [] } = useGetCategoriesQuery();
    const [createNews] = useCreateNewsMutation();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleRemoveImage = () => {
        setFile(null);
        setPreview(null);
        const input = document.getElementById('coverImage') as HTMLInputElement;
        if (input) input.value = '';
    };

    const handleDragOver = (e: React.DragEvent) => e.preventDefault();

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

    const validateForm = (): { valid: boolean; file?: File } => {
        if (!title.trim()) {
            toast.warning('Please enter a title');
            return { valid: false };
        }
        if (!content.trim()) {
            toast.warning('Please enter content');
            return { valid: false };
        }
        if (!categoryId) {
            toast.warning('Please select a category');
            return { valid: false };
        }
        if (!file) {
            toast.warning('Please select a cover image');
            return { valid: false };
        }
        return { valid: true, file };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validation = validateForm();
        if (!validation.valid || !validation.file) return;

        setIsSubmitting(true);
        try {
            await createNews({
                title: title.trim(),
                content: content.trim(),
                summary: summary.trim() || content.trim().slice(0, 150),
                image: validation.file,
                category_id: categoryId,
                is_published: isPublished,
            }).unwrap();
            toast.success('Post created successfully');
            router.push('/website-cms/news-blog');
        } catch {
            toast.error('Failed to create post');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveDraft = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsPublished(false);
        // Trigger form submission
        const fakeEvent = new Event('submit') as any;
        handleSubmit(fakeEvent);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Icon name="edit" width={24} height={24} color="#1B1B1B" />
                    <h1 className="text-[#1B1B1B] font-inter text-2xl font-bold leading-8 tracking-tight">
                        New Blog Post
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleSaveDraft}
                        className="py-2.5 px-4 text-[#777980]"
                    >
                        Save as a draft
                    </Button>
                    <Button
                        type="submit"
                        isLoading={isSubmitting}
                        loadingText="Publishing..."
                        className="py-2.5 px-4"
                    >
                        Publish
                    </Button>
                </div>
            </div>

            {/* Form Fields */}
            <NewsFormFields
                title={title}
                setTitle={setTitle}
                content={content}
                setContent={setContent}
                summary={summary}
                setSummary={setSummary}
                categoryId={categoryId}
                setCategoryId={setCategoryId}
                categories={categories}
                preview={preview}
                onFileChange={handleFileChange}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onImageRemove={handleRemoveImage}
            />
        </form>
    );
}