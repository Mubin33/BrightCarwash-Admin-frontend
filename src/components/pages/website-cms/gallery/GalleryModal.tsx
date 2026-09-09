"use client";

import { useState, useEffect, useRef } from 'react';
import { X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCreateGalleryMutation, useUpdateGalleryMutation } from '@/services/gallery.api';
import type { GalleryItem } from '@/types/gallery';
import { toast } from 'react-toastify';

interface GalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
    item?: GalleryItem | null;
    onSuccess: () => void;
}

export function GalleryModal({ isOpen, onClose, item, onSuccess }: GalleryModalProps) {
    const [name, setName] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isPublished, setIsPublished] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [createGallery] = useCreateGalleryMutation();
    const [updateGallery] = useUpdateGalleryMutation();

    const isEditing = !!item;

    // Handle slide animation
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [isOpen]);

    // Reset form when modal opens
    useEffect(() => {
        if (item) {
            setName(item.name);
            setPreview(item.image);
            setIsPublished(item.is_published);
        } else {
            setName('');
            setFile(null);
            setPreview(null);
            setIsPublished(true);
        }
    }, [item, isOpen]);

    // Handle click outside to close
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
        setTimeout(() => {
            onClose();
        }, 300);
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
        if (!name.trim()) {
            toast.warning('Please enter a name');
            return;
        }
        if (!file && !isEditing) {
            toast.warning('Please select an image');
            return;
        }

        setIsSubmitting(true);
        try {
            if (isEditing && item) {
                await updateGallery({
                    id: item.id,
                    data: {
                        name: name.trim(),
                        ...(file ? { file } : {}),
                        is_published: isPublished,
                    },
                }).unwrap();
                toast.success('Gallery item updated successfully');
            } else {
                await createGallery({
                    name: name.trim(),
                    file: file!,
                    is_published: isPublished,
                }).unwrap();
                toast.success('Gallery item created successfully');
            }
            onSuccess();
        } catch {
            toast.error(isEditing ? 'Failed to update gallery item' : 'Failed to create gallery item');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'
                    }`}
                onClick={handleClose}
            />

            {/* Modal - Slides in from right */}
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-[560px] bg-white z-50 shadow-xl transition-transform duration-300 ease-out ${isVisible ? 'translate-x-0' : 'translate-x-full'
                    }`}
                ref={modalRef}
            >
                <div className="flex flex-col h-full p-6">
                    {/* Header */}
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <h2 className="text-[#1D1F2C] font-inter text-2xl font-medium leading-[132%]">
                                {isEditing ? 'Edit Gallery Item' : 'Add New Gallery'}
                            </h2>
                            <button
                                onClick={handleClose}
                                className="p-2 rounded-lg hover:bg-[#F8FAFB] transition-colors"
                                aria-label="Close modal"
                            >
                                <X size={24} className="text-[#4A4C56]" />
                            </button>
                        </div>
                        <div className="w-full h-px bg-[#DFE1E7]" />
                    </div>

                    {/* Form Content */}
                    <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4 py-4">
                        {/* Name */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#777980] font-inter text-base font-normal leading-[130%]">
                                Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter gallery name..."
                                className="w-full px-4 py-3 border border-[#DFE1E7] rounded-lg bg-white text-[#1B1B1B] placeholder-[#A5A5AB] font-inter text-base outline-none focus:border-[#0098E8] focus:ring-2 focus:ring-[#0098E8]/10 transition-all"
                            />
                        </div>

                        {/* File Upload */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#777980] font-inter text-base font-normal leading-[130%]">
                                Image
                            </label>
                            <div
                                className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${preview
                                        ? 'border-[#0098E8] bg-[#F0F8FF]'
                                        : 'border-[#DFE1E7] bg-[#F8FAFB] hover:border-[#0098E8] hover:bg-[#F0F8FF]'
                                    }`}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {preview ? (
                                    <div className="relative">
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            className="max-h-[200px] mx-auto rounded-lg object-contain"
                                        />
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
                                        <p className="text-[#1B1B1B] font-inter text-sm font-medium">
                                            Drop your image here, or <span className="text-[#0098E8]">browse</span>
                                        </p>
                                        <p className="text-[#A5A5AB] font-inter text-xs">
                                            PNG, JPG, WEBP up to 10MB
                                        </p>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#777980] font-inter text-base font-normal leading-[130%]">
                                Status
                            </label>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsPublished(false)}
                                    className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${!isPublished
                                            ? 'bg-[#F7EBEA] border-[#B23730]'
                                            : 'bg-white border-[#ECEFF3] hover:border-[#DFE1E7]'
                                        }`}
                                >
                                    <div
                                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${!isPublished
                                                ? 'border-[#B23730]'
                                                : 'border-[#E8E8E9]'
                                            }`}
                                    >
                                        {!isPublished && (
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#B23730]" />
                                        )}
                                    </div>
                                    <span className="text-[#1D1F2C] font-inter text-lg font-normal leading-[132%]">
                                        Draft
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setIsPublished(true)}
                                    className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${isPublished
                                            ? 'bg-[#DCF7EA] border-[#006F1F]'
                                            : 'bg-white border-[#ECEFF3] hover:border-[#DFE1E7]'
                                        }`}
                                >
                                    <div
                                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${isPublished
                                                ? 'border-[#006F1F]'
                                                : 'border-[#E8E8E9]'
                                            }`}
                                    >
                                        {isPublished && (
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#006F1F]" />
                                        )}
                                    </div>
                                    <span className="text-[#1D1F2C] font-inter text-lg font-normal leading-[132%]">
                                        Published
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Buttons - at bottom */}
                        <div className="flex gap-3 pt-4 mt-auto border-t border-[#DFE1E7]">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                className="flex-1 py-3"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                isLoading={isSubmitting}
                                loadingText={isEditing ? 'Saving...' : 'Creating...'}
                                className="flex-1 py-3"
                            >
                                {isEditing ? 'Save Changes' : 'Add Gallery'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}