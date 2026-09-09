"use client";

import { useState } from 'react';
import { Pagination } from '@/components/ui/Pagination';
import { TestimonialsHeader } from './TestimonialsHeader';
import { TestimonialsFilters } from './TestimonialsFilters';
import { TestimonialsGridView } from './TestimonialsGridView';
import { TestimonialsListView } from './TestimonialsListView';
import { TestimonialsModal } from './TestimonialsModal';
import { useGetTestimonialsQuery, useDeleteTestimonialMutation } from '@/services/testimonial.api';
import type { Testimonial } from '@/types/testimonial';
import { toast } from 'react-toastify';

const ITEMS_PER_PAGE = 10;

export function TestimonialsContent() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortFilter, setSortFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const [sortBy, sortOrder] = sortFilter.includes('rating')
        ? ['rating', sortFilter.includes('asc') ? 'asc' : 'desc']
        : ['created_at', sortFilter.includes('asc') ? 'asc' : 'desc'];

    const { data: items = [], isLoading, refetch } = useGetTestimonialsQuery({
        search: searchQuery || undefined,
        is_active: statusFilter ? statusFilter === 'true' : undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
    });

    const [deleteTestimonial] = useDeleteTestimonialMutation();

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

    const handleEdit = (item: Testimonial) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this testimonial?')) return;
        try {
            await deleteTestimonial(id).unwrap();
            toast.success('Testimonial deleted successfully');
            refetch();
        } catch {
            toast.error('Failed to delete testimonial');
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

    const totalItems = items.length > 0 ? items.length : 0;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

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
            <TestimonialsHeader onAddClick={() => setIsModalOpen(true)} />

            <TestimonialsFilters
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
                <TestimonialsGridView
                    items={items}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            ) : (
                <TestimonialsListView
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

            <TestimonialsModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                item={editingItem}
                onSuccess={handleModalSuccess}
            />
        </div>
    );
}