'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { toast } from 'react-toastify';
import { X } from 'lucide-react';

interface KnowledgeUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (title: string, file: File) => Promise<void>;
    isUploading: boolean;
}

export function KnowledgeUploadModal({
    isOpen,
    onClose,
    onUpload,
    isUploading,
}: KnowledgeUploadModalProps) {
    const [documentTitle, setDocumentTitle] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
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

    const handleFileSelect = (file: File) => {
        const validTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
            'text/plain',
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];

        const maxSize = 100 * 1024 * 1024; // 100MB

        if (!validTypes.includes(file.type)) {
            toast.error('Please upload a valid file type (PDF, DOCX, TXT, CSV, Excel)');
            return;
        }

        if (file.size > maxSize) {
            toast.error('File size must be less than 100MB');
            return;
        }

        setSelectedFile(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
        e.target.value = '';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleSubmit = async () => {
        if (!documentTitle.trim()) {
            toast.error('Please enter a document title');
            return;
        }
        if (!selectedFile) {
            toast.error('Please select a file to upload');
            return;
        }

        await onUpload(documentTitle, selectedFile);
        setDocumentTitle('');
        setSelectedFile(null);
    };

    const handleClose = () => {
        setDocumentTitle('');
        setSelectedFile(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={handleClose}
            />

            {/* Slide-in Panel from right */}
            <div className="fixed top-0 right-0 h-full w-full max-w-[520px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out adm-slide-in-right overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Add New Documents
                    </h2>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        disabled={isUploading}
                    >
                        <X size={20} className="text-gray-600" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex flex-col gap-6">
                        {/* Document Title */}
                        <div className="flex flex-col gap-2">
                            <label className="text-zinc-500 text-base font-normal font-['Inter'] leading-5">
                                Document Title
                            </label>
                            <input
                                type="text"
                                value={documentTitle}
                                onChange={(e) => setDocumentTitle(e.target.value)}
                                placeholder="Enter document title"
                                disabled={isUploading}
                                className="w-full p-4 bg-gray-50 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 text-neutral-600 text-base font-normal font-['Inter'] leading-6 placeholder:text-neutral-400 focus:outline-2 focus:outline-sky-500 disabled:opacity-50"
                            />
                        </div>

                        {/* Upload Area */}
                        <div className="flex flex-col gap-2">
                            <label className="text-zinc-500 text-base font-normal font-['Inter'] leading-5">
                                Upload Document
                            </label>
                            <div
                                className={`h-40 p-5 bg-gray-50 rounded-lg outline outline-2 outline-offset-[-2px] flex flex-col justify-center items-center gap-4 transition-all cursor-pointer ${isDragging ? 'outline-sky-500 bg-sky-50' : 'outline-zinc-200'
                                    } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onClick={() => !isUploading && fileInputRef.current?.click()}
                            >
                                <Icon name="upload" width={32} height={32} />
                                <div className="flex flex-col justify-center items-center gap-3">
                                    <span className="text-neutral-600 text-base font-medium font-['Inter'] leading-4">
                                        Drag and drop a file here
                                    </span>
                                    <span className="text-zinc-500 text-sm font-normal font-['Inter'] leading-5">
                                        PDF, DOCX, TXT, CSV, Excel - max 100MB
                                    </span>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.docx,.doc,.txt,.csv,.xlsx,.xls"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    disabled={isUploading}
                                />
                            </div>
                        </div>

                        {/* Selected File */}
                        {selectedFile && (
                            <div className="h-11 p-3 bg-gray-50 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <Icon name="file" width={24} height={24} />
                                    <span className="text-gray-900 text-sm font-normal font-['Inter'] leading-5 line-clamp-1">
                                        {selectedFile.name}
                                    </span>
                                    <span className="text-gray-500 text-xs font-normal font-['Inter']">
                                        ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                    </span>
                                </div>
                                <button
                                    onClick={() => setSelectedFile(null)}
                                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                                    disabled={isUploading}
                                >
                                    <Icon name="delete" width={20} height={20} />
                                </button>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end items-center gap-3 pt-4 border-t border-zinc-200">
                            <Button
                                variant="outline"
                                className="flex-1 px-5 py-3 rounded-sm outline outline-1 outline-offset-[-1px] outline-zinc-200 text-neutral-600 text-base font-medium font-['Inter'] leading-5"
                                onClick={handleClose}
                                disabled={isUploading}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-1 px-5 py-3 bg-sky-500 rounded-sm text-white text-base font-medium font-['Inter'] leading-5"
                                onClick={handleSubmit}
                                isLoading={isUploading}
                                loadingText="Uploading..."
                                disabled={isUploading}
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}