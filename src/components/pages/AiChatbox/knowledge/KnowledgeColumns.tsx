'use client';

import { Icon } from '@/components/ui/Icon';
import { KnowledgeActionDropdown } from './KnowledgeActionDropdown';
import type { KnowledgeFile } from '@/types/knowledge';

const getFileExtension = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toUpperCase() || 'Unknown';
    const typeMap: Record<string, string> = {
        'PDF': 'PDF',
        'DOCX': 'Word',
        'DOC': 'Word',
        'TXT': 'Text',
        'CSV': 'CSV',
        'XLSX': 'Excel',
        'XLS': 'Excel',
    };
    return typeMap[ext] || ext;
};

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const getKnowledgeColumns = (
    onView: (id: number) => void,
    onDelete: (id: number) => void,
    isDeleting: boolean
) => [
        {
            key: 'title',
            header: 'File name',
            render: (row: KnowledgeFile) => (
                <div className="flex items-center gap-2.5">
                    <Icon name="file" width={24} height={24} />
                    <span className="text-gray-900 text-sm font-normal font-['Inter'] leading-5 line-clamp-1">
                        {row.title}
                    </span>
                </div>
            ),
        },
        {
            key: 'type',
            header: 'Type',
            render: (row: KnowledgeFile) => (
                <span className="text-gray-900 text-sm font-normal font-['Inter'] leading-5 line-clamp-1">
                    {getFileExtension(row.file)}
                </span>
            ),
        },
        {
            key: 'uploaded_at',
            header: 'Uploaded Date',
            render: (row: KnowledgeFile) => (
                <span className="text-gray-900 text-sm font-normal font-['Inter'] leading-5 line-clamp-1">
                    {formatDate(row.uploaded_at)}
                </span>
            ),
        },
        {
            key: 'chunk_count',
            header: 'Chunks',
            render: (row: KnowledgeFile) => (
                <span className="text-gray-900 text-sm font-normal font-['Inter'] leading-5 line-clamp-1">
                    {row.chunk_count || 0} chunks
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (row: KnowledgeFile) => (
                <span className={`text-sm font-normal font-['Inter'] leading-5 ${row.is_processed ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                    {row.is_processed ? '✓ Processed' : row.processing_error ? '⚠ Failed' : '⏳ Processing...'}
                </span>
            ),
        },
        {
            key: 'actions',
            header: '',
            render: (row: KnowledgeFile) => (
                <KnowledgeActionDropdown
                    onView={() => onView(row.id)}
                    onDelete={() => onDelete(row.id)}
                    isDeleting={isDeleting}
                />
            ),
        },
    ];