'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { toast } from 'react-toastify';
import { X, Calendar } from 'lucide-react';

interface CampaignCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: {
        title: string;
        description: string;
        image?: File | null;
        is_active: boolean;
        start_date?: string;
        end_date?: string;
    }) => Promise<void>;
    isCreating: boolean;
}

export function CampaignCreateModal({
    isOpen,
    onClose,
    onCreate,
    isCreating,
}: CampaignCreateModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isActive, setIsActive] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                return;
            }
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result as string);
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            toast.error('Please enter a campaign name');
            return;
        }
        if (!description.trim()) {
            toast.error('Please enter a campaign description');
            return;
        }

        await onCreate({
            title: title.trim(),
            description: description.trim(),
            image: selectedFile,
            is_active: isActive,
            start_date: startDate || undefined,
            end_date: endDate || undefined,
        });

        setTitle('');
        setDescription('');
        setSelectedFile(null);
        setPreviewUrl(null);
        setIsActive(true);
        setStartDate('');
        setEndDate('');
    };

    const handleClose = () => {
        setTitle('');
        setDescription('');
        setSelectedFile(null);
        setPreviewUrl(null);
        setIsActive(true);
        setStartDate('');
        setEndDate('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose} />

            {/* Slide-in Panel from right */}
            <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out adm-slide-in-right overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
                    <h2 className="text-neutral-800 text-2xl font-medium font-['Inter'] leading-8">
                        Add New Campaign
                    </h2>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        disabled={isCreating}
                    >
                        <X size={20} className="text-gray-600" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex flex-col gap-6">
                        {/* Campaign Photo */}
                        <div className="flex flex-col gap-4">
                            <div className="text-zinc-500 text-base font-normal font-['Inter'] leading-5">
                                Campaign Photo
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-5 bg-gray-50 rounded-lg outline outline-2 outline-offset-[-2px] outline-zinc-200 flex justify-start items-center">
                                    {previewUrl ? (
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="w-8 h-8 object-cover rounded"
                                        />
                                    ) : (
                                        <Icon name="upload" width={32} height={32} />
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col gap-3">
                                    <Button
                                        variant="outline"
                                        className="px-4 py-2.5 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 text-neutral-800 text-sm font-medium font-['Inter'] leading-4"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isCreating}
                                    >
                                        Upload Photo
                                    </Button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        disabled={isCreating}
                                    />
                                    <div className="text-neutral-600 text-base font-normal font-['Inter'] leading-5">
                                        PNG, JPG up to 5MB. Circular crop applied.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Campaign Name */}
                        <div className="flex flex-col gap-2">
                            <div className="text-zinc-500 text-base font-normal font-['Inter'] leading-5">
                                Campaign Name
                            </div>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter campaign name"
                                disabled={isCreating}
                                className="w-full p-4 bg-gray-50 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 text-neutral-600 text-base font-normal font-['Inter'] leading-6 placeholder:text-neutral-400 focus:outline-2 focus:outline-sky-500 disabled:opacity-50"
                            />
                        </div>

                        {/* Campaign Description */}
                        <div className="flex flex-col gap-2">
                            <div className="text-zinc-500 text-base font-normal font-['Inter'] leading-5">
                                Campaign Description
                            </div>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter campaign description"
                                disabled={isCreating}
                                maxLength={300}
                                rows={4}
                                className="w-full p-4 bg-gray-50 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 text-neutral-600 text-base font-normal font-['Inter'] leading-6 placeholder:text-neutral-400 focus:outline-2 focus:outline-sky-500 disabled:opacity-50 resize-none"
                            />
                            <div className="text-right text-zinc-500 text-base font-normal font-['Inter'] leading-5">
                                {description.length}/300
                            </div>
                        </div>

                        {/* Dates - using shadcn-like date inputs */}
                        <div className="flex gap-4">
                            <div className="flex-1 flex flex-col gap-2">
                                <div className="text-zinc-500 text-base font-normal font-['Inter'] leading-5">
                                    Starting Date
                                </div>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        disabled={isCreating}
                                        className="w-full p-4 bg-gray-50 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 text-neutral-600 text-base font-normal font-['Inter'] leading-6 focus:outline-2 focus:outline-sky-500 disabled:opacity-50 appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                                    />
                                    <Calendar size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col gap-2">
                                <div className="text-zinc-500 text-base font-normal font-['Inter'] leading-5">
                                    Ending Date
                                </div>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        disabled={isCreating}
                                        className="w-full p-4 bg-gray-50 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 text-neutral-600 text-base font-normal font-['Inter'] leading-6 focus:outline-2 focus:outline-sky-500 disabled:opacity-50 appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                                    />
                                    <Calendar size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="flex flex-col gap-2">
                            <div className="text-zinc-500 text-base font-normal font-['Inter'] leading-5">
                                Status
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsActive(false)}
                                    className={`flex-1 px-4 py-3 rounded-lg outline outline-1 outline-offset-[-1px] flex items-center gap-2 transition-colors ${!isActive
                                            ? 'outline-red-700 bg-pink-100'
                                            : 'outline-gray-100 bg-white'
                                        }`}
                                    disabled={isCreating}
                                >
                                    <div
                                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${!isActive
                                                ? 'border-red-700'
                                                : 'border-gray-200'
                                            }`}
                                    >
                                        {!isActive && (
                                            <div className="w-2.5 h-2.5 bg-red-700 rounded-full" />
                                        )}
                                    </div>
                                    <span className="text-neutral-800 text-lg font-normal font-['Inter'] leading-6 line-clamp-1">
                                        Inactive
                                    </span>
                                </button>
                                <button
                                    onClick={() => setIsActive(true)}
                                    className={`flex-1 px-4 py-3 rounded-lg outline outline-1 outline-offset-[-1px] flex items-center gap-2 transition-colors ${isActive
                                            ? 'outline-green-700 bg-green-50'
                                            : 'outline-gray-100 bg-white'
                                        }`}
                                    disabled={isCreating}
                                >
                                    <div
                                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${isActive
                                                ? 'border-green-700'
                                                : 'border-gray-200'
                                            }`}
                                    >
                                        {isActive && (
                                            <div className="w-2.5 h-2.5 bg-green-700 rounded-full" />
                                        )}
                                    </div>
                                    <span className="text-neutral-800 text-lg font-normal font-['Inter'] leading-6 line-clamp-1">
                                        Active
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end items-center gap-3 pt-4 border-t border-zinc-200">
                            <Button
                                variant="outline"
                                className="flex-1 px-5 py-3 rounded-sm outline outline-1 outline-offset-[-1px] outline-zinc-200 text-neutral-600 text-base font-medium font-['Inter'] leading-5"
                                onClick={handleClose}
                                disabled={isCreating}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-1 px-5 py-3 bg-sky-500 rounded-sm text-white text-base font-medium font-['Inter'] leading-5"
                                onClick={handleSubmit}
                                isLoading={isCreating}
                                loadingText="Creating..."
                                disabled={isCreating}
                            >
                                Add Campaign
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}