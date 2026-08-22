"use client";

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Pagination } from '@/components/ui/Pagination';
import { NewsHeader } from './NewsHeader';
import { NewsFilters } from './NewsFilters';
import { NewsGridView } from './NewsGridView';
import { NewsListView } from './NewsListView';
import { NewsModal } from './NewsModal';
import { CategoryModal } from './CategoryModal';
import { useGetNewsQuery, useDeleteNewsMutation } from '@/services/news.api';
import { useGetCategoriesQuery } from '@/services/category.api';
import type { NewsItem } from '@/types/news';
import { toast } from 'react-toastify';

const ITEMS_PER_PAGE = 10;

export function NewsContent() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [sortFilter, setSortFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const [sortBy, sortOrder] = sortFilter.includes('title')
        ? ['title', sortFilter.includes('asc') ? 'asc' : 'desc']
        : ['created_at', sortFilter.includes('asc') ? 'asc' : 'desc'];

    const { data: categories = [] } = useGetCategoriesQuery();

    const { data: items = [], isLoading, refetch } = useGetNewsQuery({
        search: searchQuery || undefined,
        category_id: categoryFilter || undefined,
        is_published: statusFilter ? statusFilter === 'true' : undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
    });

    const [deleteNews] = useDeleteNewsMutation();

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

    const handleEdit = (item: NewsItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        try {
            await deleteNews(id).unwrap();
            toast.success('Post deleted successfully');
            refetch();
        } catch {
            toast.error('Failed to delete post');
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

    const handleAddNew = () => {
        router.push('/website-cms/news-blog/create');
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
            <NewsHeader
                onCategoryClick={() => setIsCategoryModalOpen(true)}
                onAddClick={handleAddNew}
            />

            <NewsFilters
                searchInput={searchInput}
                onSearchChange={setSearchInput}
                onSearchSubmit={handleSearchSubmit}
                onSearchKeyDown={handleSearchKeyDown}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                categoryFilter={categoryFilter}
                onCategoryChange={setCategoryFilter}
                categories={categories}
                sortFilter={sortFilter}
                onSortChange={setSortFilter}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />

            {viewMode === 'grid' ? (
                <NewsGridView
                    items={items}
                    categories={categories}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            ) : (
                <NewsListView
                    items={items}
                    categories={categories}
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

            <NewsModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                item={editingItem}
                onSuccess={handleModalSuccess}
            />

            <CategoryModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
            />
        </div>
    );
}