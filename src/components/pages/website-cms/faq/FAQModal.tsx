"use client";

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCreateFAQMutation, useUpdateFAQMutation } from '@/services/faq.api';
import type { FAQ } from '@/types/faq';
import { toast } from 'react-toastify';

interface FAQModalProps {
    isOpen: boolean;
    onClose: () => void;
    faq?: FAQ | null;
    onSuccess: () => void;
}

export function FAQModal({ isOpen, onClose, faq, onSuccess }: FAQModalProps) {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    const [createFAQ] = useCreateFAQMutation();
    const [updateFAQ] = useUpdateFAQMutation();

    const isEditing = !!faq;

    useEffect(() => {
        if (faq) {
            setQuestion(faq.question);
            setAnswer(faq.answer);
            setIsActive(faq.is_active);
        } else {
            setQuestion('');
            setAnswer('');
            setIsActive(true);
        }
    }, [faq, isOpen]);

    // Handle slide animation
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [isOpen]);

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
        }, 300); // Wait for animation to complete
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim() || !answer.trim()) {
            toast.warning('Please fill in all fields');
            return;
        }

        setIsSubmitting(true);
        try {
            if (isEditing && faq) {
                await updateFAQ({
                    id: faq.id,
                    data: {
                        question: question.trim(),
                        answer: answer.trim(),
                        is_active: isActive,
                    },
                }).unwrap();
                toast.success('FAQ updated successfully');
            } else {
                await createFAQ({
                    question: question.trim(),
                    answer: answer.trim(),
                    is_active: isActive,
                    display_order: 0,
                }).unwrap();
                toast.success('FAQ created successfully');
            }
            onSuccess();
        } catch {
            toast.error(isEditing ? 'Failed to update FAQ' : 'Failed to create FAQ');
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
                className={`fixed top-0 right-0 h-full w-full max-w-140 bg-white z-50 shadow-xl transition-transform duration-300 ease-out ${isVisible ? 'translate-x-0' : 'translate-x-full'
                    }`}
                ref={modalRef}
            >
                <div className="flex flex-col h-full p-6">
                    {/* Header */}
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <h2 className="text-[#1D1F2C] font-inter text-2xl font-medium leading-[132%]">
                                {isEditing ? 'Edit FAQ' : 'New FAQ'}
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
                        {/* Question */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#777980] font-inter text-base font-normal leading-[130%]">
                                Question
                            </label>
                            <div className="flex items-center justify-between p-4 bg-[#F8FAFB] rounded-lg border border-[#DFE1E7]">
                                <input
                                    type="text"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    placeholder="What's the difference between an exterior wash and a full-service wash?"
                                    className="flex-1 bg-transparent border-none outline-none text-[#4A4C56] font-inter text-base font-normal leading-[150%] placeholder-[#A5A5AB]"
                                />
                            </div>
                        </div>

                        {/* Answer */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[#777980] font-inter text-base font-normal leading-[130%]">
                                Answer
                            </label>
                            <div className="flex items-start p-4 bg-[#F8FAFB] rounded-lg border border-[#DFE1E7] min-h-30">
                                <textarea
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    placeholder="Our exterior wash runs you through our state-of-the-art tunnel — fast, spotless, and no appointment needed..."
                                    rows={4}
                                    className="flex-1 bg-transparent border-none outline-none text-[#4A4C56] font-inter text-base font-normal leading-[150%] placeholder-[#A5A5AB] resize-none"
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
                                    onClick={() => setIsActive(false)}
                                    className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${!isActive
                                        ? 'bg-[#F7EBEA] border-[#B23730]'
                                        : 'bg-white border-[#ECEFF3] hover:border-[#DFE1E7]'
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
                                    <span className="text-[#1D1F2C] font-inter text-lg font-normal leading-[132%]">
                                        Draft
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setIsActive(true)}
                                    className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${isActive
                                        ? 'bg-[#DCF7EA] border-[#006F1F]'
                                        : 'bg-white border-[#ECEFF3] hover:border-[#DFE1E7]'
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
                                {isEditing ? 'Save Changes' : 'Save FAQ'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}