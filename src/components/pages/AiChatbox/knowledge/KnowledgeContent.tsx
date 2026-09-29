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
    DeleteKnowledgeModal,
} from './';
import { downloadFile } from '@/lib/file-export';
import type { KnowledgeFile } from '@/types/knowledge';

export function KnowledgeContent() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
    const [fileToDelete, setFileToDelete] = useState<KnowledgeFile | null>(null);

    const { data: files, isLoading, refetch } = useGetKnowledgeFilesQuery();
    const [uploadFile, { isLoading: isUploading }] = useUploadKnowledgeFileMutation();
    const [deleteFile, { isLoading: isDeleting }] = useDeleteKnowledgeFileMutation();
    const { data: fileDetail, isLoading: isDetailLoading } = useGetKnowledgeFileDetailQuery(
        selectedFileId!,
        { skip: !selectedFileId }
    );

    const handleDeleteClick = (file: KnowledgeFile) => {
        setFileToDelete(file);
    };

    const handleConfirmDelete = async () => {
        if (!fileToDelete) return;
        try {
            const result = await deleteFile(fileToDelete.id).unwrap();
            toast.success(result.message || 'File deleted successfully');
            setFileToDelete(null);
            refetch();
        } catch {
            toast.error('Failed to delete file');
        }
    };

    const handleUpload = async (title: string, file: File) => {
        try {
            await uploadFile({ title, file }).unwrap();
            toast.success('File uploaded successfully');
            setIsModalOpen(false);
            refetch();
        } catch {
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

            // Use the generic file download utility
            const result = await downloadFile({
                fileUrl,
                fileName,
                fileExtension: extension,
            });

            if (result.success) {
                toast.success('File downloaded successfully');
            } else {
                toast.error('Failed to download file');
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
        handleDeleteClick,
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

            <DeleteKnowledgeModal
                isOpen={!!fileToDelete}
                onClose={() => {
                    if (!isDeleting) setFileToDelete(null);
                }}
                file={fileToDelete}
                onConfirm={handleConfirmDelete}
                isLoading={isDeleting}
            />
        </>
    );
}
