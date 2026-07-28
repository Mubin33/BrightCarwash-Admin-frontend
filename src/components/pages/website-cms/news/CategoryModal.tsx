'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Plus, Edit2, Trash2, Check, X as XIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useGetCategoriesQuery, useCreateCategoryMutation, useDeleteCategoryMutation, useUpdateCategoryMutation } from '@/services/category.api';
import type { Category } from '@/types/news';
import { toast } from 'react-toastify';

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CategoryModal({ isOpen, onClose }: CategoryModalProps) {
    const [newCategory, setNewCategory] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    const { data: categories = [], refetch } = useGetCategoriesQuery();
    const [createCategory] = useCreateCategoryMutation();
    const [updateCategory] = useUpdateCategoryMutation();
    const [deleteCategory] = useDeleteCategoryMutation();

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [isOpen]);

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
        setEditingId(null);
        setEditingName('');
        setTimeout(() => onClose(), 300);
    };

    const handleAddCategory = async () => {
        if (!newCategory.trim()) {
            toast.warning('Please enter a category name');
            return;
        }
        setIsSubmitting(true);
        try {
            await createCategory({ name: newCategory.trim() }).unwrap();
            toast.success('Category added successfully');
            setNewCategory('');
            refetch();
        } catch {
            toast.error('Failed to add category');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStartEdit = (category: Category) => {
        setEditingId(category.id);
        setEditingName(category.name);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingName('');
    };

    const handleSaveEdit = async (id: string) => {
        if (!editingName.trim()) {
            toast.warning('Please enter a category name');
            return;
        }
        setIsSubmitting(true);
        try {
            await updateCategory({ id, data: { name: editingName.trim() } }).unwrap();
            toast.success('Category updated successfully');
            setEditingId(null);
            setEditingName('');
            refetch();
        } catch {
            toast.error('Failed to update category');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCategory = async (id: string, name: string) => {
        if (!confirm(`Delete category "${name}"?`)) return;
        try {
            await deleteCategory(id).unwrap();
            toast.success('Category deleted successfully');
            refetch();
        } catch {
            toast.error('Failed to delete category');
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div
                className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'
                    }`}
                onClick={handleClose}
            />
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-[520px] bg-white z-50 shadow-xl transition-transform duration-300 ease-out ${isVisible ? 'translate-x-0' : 'translate-x-full'
                    }`}
                ref={modalRef}
            >
                <div className="flex flex-col h-full p-6">
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <h2 className="text-[#1D1F2C] font-inter text-2xl font-medium leading-8">
                                Manage Categories
                            </h2>
                            <button
                                onClick={handleClose}
                                className="p-2 rounded-lg hover:bg-[#F8FAFB] transition-colors"
                            >
                                <X size={24} className="text-[#4A4C56]" />
                            </button>
                        </div>
                        <div className="w-full h-px bg-[#DFE1E7]" />
                    </div>

                    <div className="flex-1 flex flex-col gap-4 py-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-[#777980] font-inter text-base font-normal leading-5">
                                Add New Category
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    placeholder="Category name…"
                                    className="flex-1 px-4 py-3 bg-[#F8FAFB] rounded-lg border border-[#DFE1E7] text-[#1B1B1B] placeholder-[#777980] font-inter text-base outline-none focus:border-[#0098E8] transition-all"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                                />
                                <Button
                                    onClick={handleAddCategory}
                                    isLoading={isSubmitting}
                                    className="w-auto! px-4 py-3"
                                >
                                    <Plus size={20} color="white" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[#777980] font-inter text-base font-normal leading-5">
                                Existing Categories
                            </label>
                            <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto adm-notes-scroll">
                                {categories.length === 0 ? (
                                    <p className="text-center text-[#777980] py-4 text-sm">No categories yet</p>
                                ) : (
                                    categories.map((cat) => (
                                        <div
                                            key={cat.id}
                                            className="flex items-center justify-between p-4 bg-white rounded-lg border border-[#DFE1E7]"
                                        >
                                            {editingId === cat.id ? (
                                                <div className="flex-1 flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={editingName}
                                                        onChange={(e) => setEditingName(e.target.value)}
                                                        className="flex-1 px-3 py-2 bg-[#F8FAFB] rounded-lg border border-[#DFE1E7] text-[#1B1B1B] placeholder-[#777980] font-inter text-base outline-none focus:border-[#0098E8] transition-all"
                                                        autoFocus
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleSaveEdit(cat.id);
                                                            if (e.key === 'Escape') handleCancelEdit();
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() => handleSaveEdit(cat.id)}
                                                        className="p-2 rounded-lg bg-[#0098E8] text-white hover:bg-[#0088D8] transition-colors"
                                                        disabled={isSubmitting}
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="p-2 rounded-lg bg-[#F1F1F1] text-[#777980] hover:bg-[#E8E8E9] transition-colors"
                                                        disabled={isSubmitting}
                                                    >
                                                        <XIcon size={18} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="text-[#1B1B1B] font-inter text-base leading-6">
                                                        {cat.name}
                                                    </span>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => handleStartEdit(cat)}
                                                            className="p-1 rounded-lg text-[#777980] hover:bg-[#F8FAFB] transition-colors"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                                            className="p-1 rounded-lg text-[#777980] hover:bg-[#FFE6E6] hover:text-[#FF4345] transition-colors"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}