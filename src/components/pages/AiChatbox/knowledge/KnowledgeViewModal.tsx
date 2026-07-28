'use client';

import { useEffect } from 'react';
import { Icon } from '@/components/ui/Icon';
import { X } from 'lucide-react';
import type { KnowledgeFileDetail } from '@/types/knowledge';

interface KnowledgeViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    file: KnowledgeFileDetail | null;
    isLoading: boolean;
}

export function KnowledgeViewModal({
    isOpen,
    onClose,
    file,
    isLoading,
}: KnowledgeViewModalProps) {
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

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={onClose}
            />

            {/* Slide-in Panel from right */}
            <div className="fixed top-0 right-0 h-full w-full max-w-[520px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out adm-slide-in-right overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Document Details
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-600" />
                    </button>
                </div>

                <div className="p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500" />
                        </div>
                    ) : file ? (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Title</h3>
                                <p className="mt-1 text-lg text-gray-900">{file.title}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">File</h3>
                                <p className="mt-1 text-sm text-gray-600 break-all">{file.file}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Uploaded</h3>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {new Date(file.uploaded_at).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Chunks</h3>
                                    <p className="mt-1 text-sm text-gray-900">{file.chunk_count || 0}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                                <span className={`mt-1 inline-flex px-2 py-1 text-xs font-medium rounded-full ${file.is_processed
                                    ? 'bg-green-100 text-green-700'
                                    : file.processing_error
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {file.is_processed
                                        ? 'Processed'
                                        : file.processing_error
                                            ? 'Failed'
                                            : 'Processing...'}
                                </span>
                                {file.processing_error && (
                                    <p className="mt-2 text-sm text-red-600">{file.processing_error}</p>
                                )}
                            </div>

                            {file.chunks && file.chunks.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-3">Chunks</h3>
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {file.chunks.map((chunk) => (
                                            <div
                                                key={chunk.id}
                                                className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-medium text-gray-500">
                                                        Chunk {chunk.chunk_index + 1}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(chunk.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-700 line-clamp-3">
                                                    {chunk.chunk_text}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            No document data available
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}