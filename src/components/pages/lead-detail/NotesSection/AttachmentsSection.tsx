"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import {
    Upload,
    Download,
    Trash2,
    File,
    FileText,
    FileImage,
    FileArchive,
    FileSpreadsheet,
    FileCode,
    FileVideo,
    FileAudio,
    FileCheck
} from "lucide-react";

interface Attachment {
    id: string;
    url: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    uploadedAt?: string;
}

interface AttachmentsSectionProps {
    attachments?: Attachment[];
    onUpload?: (files: File[]) => void;
    onDelete?: (id: string) => void;
    onDownload?: (id: string) => void;
}


function getFileIcon(mimeType: string, fileName: string) {
    const extension = fileName?.split('.').pop()?.toLowerCase() || '';

    // PDF
    if (mimeType?.includes('pdf') || extension === 'pdf') {
        return { icon: FileText, color: 'text-[#FF4345]', bg: 'bg-[#FFE6E6]' };
    }
    // Images
    if (mimeType?.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(extension)) {
        return { icon: FileImage, color: 'text-[#0098E8]', bg: 'bg-[#EBF5FF]' };
    }
    // Video
    if (mimeType?.includes('video') || ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(extension)) {
        return { icon: FileVideo, color: 'text-[#FF6B00]', bg: 'bg-[#FFF0E6]' };
    }
    // Audio
    if (mimeType?.includes('audio') || ['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(extension)) {
        return { icon: FileAudio, color: 'text-[#7B61FF]', bg: 'bg-[#F0EBFF]' };
    }
    // Archives
    if (mimeType?.includes('zip') || mimeType?.includes('rar') || ['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
        return { icon: FileArchive, color: 'text-[#FFAF00]', bg: 'bg-[#FFF7E6]' };
    }
    // Spreadsheets
    if (mimeType?.includes('sheet') || ['xls', 'xlsx', 'csv', 'ods'].includes(extension)) {
        return { icon: FileSpreadsheet, color: 'text-[#00A86B]', bg: 'bg-[#E6F7EE]' };
    }
    // Code files
    if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'xml', 'py', 'java', 'c', 'cpp'].includes(extension)) {
        return { icon: FileCode, color: 'text-[#7B61FF]', bg: 'bg-[#F0EBFF]' };
    }
    // Text files
    if (['txt', 'md', 'rtf'].includes(extension)) {
        return { icon: FileCheck, color: 'text-[#777980]', bg: 'bg-[#F1F1F1]' };
    }
    // Default
    return { icon: File, color: 'text-[#777980]', bg: 'bg-[#F1F1F1]' };
}

export function AttachmentsSection({
    attachments = [],
    onUpload,
    onDelete,
    onDownload,
}: AttachmentsSectionProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const fileArray = Array.from(files);
            if (onUpload) {
                onUpload(fileArray);
            } else {
                toast.info(`${files.length} file(s) selected`);
            }
        }
        e.target.value = "";
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const fileArray = Array.from(files);
            if (onUpload) {
                onUpload(fileArray);
            } else {
                toast.info(`${files.length} file(s) dropped`);
            }
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    const getFileDate = (attachment: Attachment) => {
        if (attachment.uploadedAt) {
            return new Date(attachment.uploadedAt).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });
        }
        return 'Recently added';
    };

    const FileIcon = ({ mimeType, fileName }: { mimeType: string; fileName: string }) => {
        const { icon: IconComponent, color, bg } = getFileIcon(mimeType, fileName);
        return (
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
                <IconComponent size={20} className={color} />
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <span className="text-[#777980] font-inter text-sm font-medium">Attachments</span>
                {attachments.length > 0 && (
                    <span className="text-xs text-[#A5A5AB]">{attachments.length} files</span>
                )}
            </div>

            {/* Upload Area */}
            <div
                className={`min-h-[100px] rounded-lg border-2 border-dashed transition-all ${isDragging
                    ? "border-[#0098E8] bg-[#EBF5FF]"
                    : "border-[#DFE1E7] bg-[#F8FAFB] hover:border-[#0098E8] hover:bg-[#F0F8FF]"
                    } flex flex-col items-center justify-center gap-2 cursor-pointer relative p-6`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <Upload size={24} className="text-[#777980]" />
                <div className="text-center">
                    <p className="text-sm text-[#1B1B1B]">
                        Drag files here or <span className="text-[#0098E8] font-medium">browse</span>
                    </p>
                    <p className="text-xs text-[#A5A5AB] mt-0.5">PDF, JPG, PNG up to 10 MB</p>
                </div>
                <input
                    type="file"
                    multiple
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                />
            </div>

            {/* ✅ Attachments List - Scrollable like Notes */}
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto adm-notes-scroll pr-1">
                {attachments.length === 0 ? (
                    <p className="text-sm text-[#777980] text-center py-4">No attachments yet</p>
                ) : (
                    attachments.map((attachment) => (
                        <div
                            key={attachment.id}
                            className="flex items-center gap-3 p-3 rounded-lg border border-[#DFE1E7] bg-white hover:shadow-sm transition-shadow"
                        >
                            {/* File Icon with smart detection */}
                            <FileIcon mimeType={attachment.mimeType} fileName={attachment.fileName} />

                            {/* File Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[#1B1B1B] truncate">
                                    {attachment.fileName}
                                </p>
                                <p className="text-xs text-[#A5A5AB]">
                                    {getFileDate(attachment)}
                                </p>
                            </div>

                            {/* Actions - Download & Delete buttons */}
                            <div className="flex items-center gap-1 shrink-0">
                                <button
                                    onClick={() => onDownload?.(attachment.id)}
                                    className="p-2 rounded-lg text-[#777980] hover:bg-[#F8FAFB] hover:text-[#1B1B1B] transition-colors"
                                    aria-label="Download file"
                                >
                                    <Download size={18} />
                                </button>
                                <button
                                    onClick={() => onDelete?.(attachment.id)}
                                    className="p-2 rounded-lg text-[#777980] hover:bg-[#FFE6E6] hover:text-[#FF4345] transition-colors"
                                    aria-label="Delete file"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}