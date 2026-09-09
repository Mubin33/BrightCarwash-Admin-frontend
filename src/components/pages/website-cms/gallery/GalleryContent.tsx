"use client";

import { useState } from 'react';
import { Pagination } from '@/components/ui/Pagination';
import { GalleryHeader } from './GalleryHeader';
import { GalleryFilters } from './GalleryFilters';
import { GalleryGridView } from './GalleryGridView';
import { GalleryListView } from './GalleryListView';
import { GalleryModal } from './GalleryModal';
import { useGetGalleryQuery, useDeleteGalleryMutation } from '@/services/gallery.api';
import type { GalleryItem } from '@/types/gallery';
import { toast } from 'react-toastify';

const ITEMS_PER_PAGE = 10;

export function GalleryContent() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortFilter, setSortFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const [sortBy, sortOrder] = sortFilter.includes('name')
        ? ['name', sortFilter.includes('asc') ? 'asc' : 'desc']
        : ['created_at', sortFilter.includes('asc') ? 'asc' : 'desc'];

    const { data, isLoading, refetch } = useGetGalleryQuery({
        search: searchQuery || undefined,
        is_published: statusFilter ? statusFilter === 'true' : undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
    });

    const items = data?.items || [];
    const totalItems = data?.totalItems || 0;
    const totalPages = data?.totalPages || 1;

    const [deleteGallery] = useDeleteGalleryMutation();

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            setSearchQuery(searchInput);
            setCurrentPage(1);
        }
    };

    const handleSearchSubmit = () => {
        setSearchQuery(searchInput);
        setCurrentPage(1);
    };

    const handleEdit = (item: GalleryItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this gallery item?')) return;
        try {
            await deleteGallery(id).unwrap();
            toast.success('Gallery item deleted successfully');
            refetch();
        } catch {
            toast.error('Failed to delete gallery item');
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleModalSuccess = () => {
        refetch();
        handleModalClose();
    };

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4 w-full">
                <div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-64 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 w-full">
            <GalleryHeader onAddClick={() => setIsModalOpen(true)} />

            <GalleryFilters
                searchInput={searchInput}
                onSearchChange={setSearchInput}
                onSearchSubmit={handleSearchSubmit}
                onSearchKeyDown={handleSearchKeyDown}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                sortFilter={sortFilter}
                onSortChange={setSortFilter}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />

            {viewMode === 'grid' ? (
                <GalleryGridView
                    items={items}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            ) : (
                <GalleryListView
                    items={items}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={totalItems}
                itemsPerPage={ITEMS_PER_PAGE}
            />

            <GalleryModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                item={editingItem}
                onSuccess={handleModalSuccess}
            />
        </div>
    );
}