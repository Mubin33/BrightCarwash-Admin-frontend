'use client';

import { useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { toast } from 'react-toastify';
import {
    useGetKnowledgeFilesQuery,
    useUploadKnowledgeFileMutation,
    useDeleteKnowledgeFileMutation,
    useGetKnowledgeFileDetailQuery,
} from '@/services/knowledge.api';
import {
    KnowledgeHeader,
    KnowledgeUploadModal,
    KnowledgeSkeleton,
    getKnowledgeColumns,
    KnowledgeViewModal,
} from './';
import { downloadFile } from '@/lib/file-export';
import type { KnowledgeFile } from '@/types/knowledge';

export function KnowledgeContent() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedFileId, setSelectedFileId] = useState<number | null>(null);

    const { data: files, isLoading, refetch } = useGetKnowledgeFilesQuery();
    const [uploadFile, { isLoading: isUploading }] = useUploadKnowledgeFileMutation();
    const [deleteFile, { isLoading: isDeleting }] = useDeleteKnowledgeFileMutation();
    const { data: fileDetail, isLoading: isDetailLoading } = useGetKnowledgeFileDetailQuery(
        selectedFileId!,
        { skip: !selectedFileId }
    );

    const selectedFile = files?.find((f) => f.id === selectedFileId) || null;

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this file?')) return;
        try {
            const result = await deleteFile(id).unwrap();
            toast.success(result.message || 'File deleted successfully');
            refetch();
        } catch (error) {
            toast.error('Failed to delete file');
        }
    };

    const handleUpload = async (title: string, file: File) => {
        try {
            await uploadFile({ title, file }).unwrap();
            toast.success('File uploaded successfully');
            setIsModalOpen(false);
            refetch();
        } catch (error) {
            toast.error('Failed to upload file');
        }
    };

    const handleView = (id: number) => {
        setSelectedFileId(id);
        setIsViewModalOpen(true);
    };

    const handleExport = async (file: KnowledgeFile) => {
        try {
            // The file URL is stored in the 'file' field
            const fileUrl = file.file;
            const fileName = file.title || 'download';

            // Extract file extension from the URL
            const extension = fileUrl.split('.').pop()?.toLowerCase() || '';

            if (!extension) {
                toast.error('Unable to determine file type');
                return;
            }

            // Download the actual file from the AI server
            const result = await downloadFile({
                fileUrl: fileUrl,
                fileName: fileName,
                fileExtension: extension,
            });

            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to download file');
        }
    };

    const handleCloseView = () => {
        setIsViewModalOpen(false);
        setSelectedFileId(null);
    };

    if (isLoading) {
        return <KnowledgeSkeleton />;
    }

    const columns = getKnowledgeColumns(
        handleView,
        handleDelete,
        (id: number) => {
            const file = files?.find((f) => f.id === id);
            if (file) {
                handleExport(file);
            }
        },
        isDeleting
    );

    return (
        <>
            <div className="flex flex-col items-start gap-8 w-full">
                <KnowledgeHeader onUploadClick={() => setIsModalOpen(true)} />

                <div className="w-full rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 overflow-hidden">
                    <DataTable
                        columns={columns}
                        data={files || []}
                        rowKey={(row) => String(row.id)}
                        className="w-full"
                    />
                </div>
            </div>

            <KnowledgeUploadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUpload={handleUpload}
                isUploading={isUploading}
            />

            <KnowledgeViewModal
                isOpen={isViewModalOpen}
                onClose={handleCloseView}
                file={fileDetail || null}
                isLoading={isDetailLoading}
            />
        </>
    );
}