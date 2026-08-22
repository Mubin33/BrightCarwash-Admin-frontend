"use client";

import { useState, useEffect, useRef } from 'react';
import { X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { RatingStars } from '@/components/ui/RatingStars';
import { useCreateTestimonialMutation, useUpdateTestimonialMutation } from '@/services/testimonial.api';
import type { Testimonial } from '@/types/testimonial';
import { toast } from 'react-toastify';

interface TestimonialsModalProps {
    isOpen: boolean;
    onClose: () => void;
    item?: Testimonial | null;
    onSuccess: () => void;
}

export function TestimonialsModal({ isOpen, onClose, item, onSuccess }: TestimonialsModalProps) {
    const [name, setName] = useState('');
    const [designation, setDesignation] = useState('');
    const [ratings, setRatings] = useState(5);
    const [reviewText, setReviewText] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isActive, setIsActive] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [createTestimonial] = useCreateTestimonialMutation();
    const [updateTestimonial] = useUpdateTestimonialMutation();

    const isEditing = !!item;

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        if (item) {
            setName(item.name);
            setDesignation(item.designation);
            setRatings(item.ratings);
            setReviewText(item.review_text);
            setPreview(item.avatar || null);
            setIsActive(item.is_active);
        } else {
            setName('');
            setDesignation('');
            setRatings(5);
            setReviewText('');
            setFile(null);
            setPreview(null);
            setIsActive(true);
        }
    }, [isOpen, item?.id]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.warning('Please enter customer name');
            return;
        }
        if (!reviewText.trim()) {
            toast.warning('Please enter the testimonial text');
            return;
        }

        setIsSubmitting(true);
        try {
            if (isEditing && item) {
                await updateTestimonial({
                    id: item.id,
                    data: {
                        name: name.trim(),
                        designation: designation.trim(),
                        ratings,
                        review_text: reviewText.trim(),
                        ...(file ? { avatar_image: file } : {}),
                        is_active: isActive,
                    },
                }).unwrap();
                toast.success('Testimonial updated successfully');
            } else {
                await createTestimonial({
                    name: name.trim(),
                    designation: designation.trim(),
                    ratings,
                    review_text: reviewText.trim(),
                    ...(file ? { avatar_image: file } : {}),
                    is_active: isActive,
                }).unwrap();
                toast.success('Testimonial created successfully');
            }
            onSuccess();
        } catch {
            toast.error(isEditing ? 'Failed to update testimonial' : 'Failed to create testimonial');
        } finally {
            setIsSubmitting(false);
        }
    };

    const reviewLength = reviewText.length;
    const maxLength = 300;

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
                                {isEditing ? 'Edit Testimonial' : 'Add New Testimonial'}
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

                    <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4 py-4 overflow-y-auto">
                        {/* Avatar Image */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#777980] font-inter text-base font-normal leading-5">Customer Photo</label>
                            <div className="flex items-start gap-4">
                                <div className="w-20 h-20 rounded-full bg-[#F8FAFB] border-2 border-dashed border-[#DFE1E7] flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#0098E8] transition-colors flex-shrink-0">
                                    {preview ? (
                                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <Upload size={24} className="text-[#A5A5AB]" />
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-auto"
                                    >
                                        Upload Photo
                                    </Button>
                                    <p className="text-[#777980] text-sm font-inter leading-5">PNG, JPG up to 5MB. Circular crop applied.</p>
                                </div>
                            </div>
                        </div>

                        {/* Name */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#777980] font-inter text-base font-normal leading-5">Customer Name *</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Sarah Mitchell"
                                className="w-full px-4 py-3 bg-[#F8FAFB] rounded-lg border border-[#DFE1E7] text-[#1B1B1B] placeholder-[#777980] font-inter text-base outline-none focus:border-[#0098E8] transition-all"
                            />
                        </div>

                        {/* Designation */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#777980] font-inter text-base font-normal leading-5">Role / Title</label>
                            <input
                                type="text"
                                value={designation}
                                onChange={(e) => setDesignation(e.target.value)}
                                placeholder="e.g. Marketing Specialist"
                                className="w-full px-4 py-3 bg-[#F8FAFB] rounded-lg border border-[#DFE1E7] text-[#1B1B1B] placeholder-[#777980] font-inter text-base outline-none focus:border-[#0098E8] transition-all"
                            />
                        </div>

                        {/* Rating */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#777980] font-inter text-base font-normal leading-5">Rating</label>
                            <div className="flex items-center gap-3">
                                <RatingStars rating={ratings} size={28} onChange={setRatings} readonly={false} />
                                <span className="text-[#777980] text-xs font-inter leading-3">{ratings} of 5</span>
                            </div>
                        </div>

                        {/* Review Text */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#777980] font-inter text-base font-normal leading-5">Review *</label>
                            <textarea
                                value={reviewText}
                                onChange={(e) => {
                                    if (e.target.value.length <= maxLength) {
                                        setReviewText(e.target.value);
                                    }
                                }}
                                placeholder="Enter the customer's testimonial text…"
                                rows={6}
                                className="w-full px-4 py-3 bg-[#F8FAFB] rounded-lg border border-[#DFE1E7] text-[#1B1B1B] placeholder-[#777980] font-inter text-base outline-none focus:border-[#0098E8] transition-all resize-none"
                            />
                            <div className="text-right text-[#777980] font-inter text-sm leading-5">
                                {reviewLength}/{maxLength}
                            </div>
                        </div>

                        {/* Status */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#777980] font-inter text-base font-normal leading-5">Status</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsActive(false)}
                                    className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${!isActive
                                        ? 'bg-[#F7EBEA] border-[#B23730]'
                                        : 'bg-white border-[#DFE1E7] hover:border-[#B23730]'
                                        }`}
                                >
                                    <div
                                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${!isActive
                                            ? 'border-[#B23730]'
                                            : 'border-[#E8E8E9]'
                                            }`}
                                    >
                                        {!isActive && (
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#B23730]" />
                                        )}
                                    </div>
                                    <span className="text-[#1B1B1B] font-inter text-lg font-normal leading-6">Draft</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setIsActive(true)}
                                    className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${isActive
                                        ? 'bg-[#DCF7EA] border-[#006F1F]'
                                        : 'bg-white border-[#DFE1E7] hover:border-[#006F1F]'
                                        }`}
                                >
                                    <div
                                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${isActive
                                            ? 'border-[#006F1F]'
                                            : 'border-[#E8E8E9]'
                                            }`}
                                    >
                                        {isActive && (
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#006F1F]" />
                                        )}
                                    </div>
                                    <span className="text-[#1B1B1B] font-inter text-lg font-normal leading-6">Published</span>
                                </button>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-4 border-t border-[#DFE1E7] mt-auto">
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
                                loadingText={isEditing ? 'Saving...' : 'Adding...'}
                                className="flex-1 py-3"
                            >
                                {isEditing ? 'Update Testimonial' : 'Add Testimonial'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}