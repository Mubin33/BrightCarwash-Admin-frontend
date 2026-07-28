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

    const handleCloseView = () => {
        setIsViewModalOpen(false);
        setSelectedFileId(null);
    };

    if (isLoading) {
        return <KnowledgeSkeleton />;
    }

    const columns = getKnowledgeColumns(handleView, handleDelete, isDeleting);

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