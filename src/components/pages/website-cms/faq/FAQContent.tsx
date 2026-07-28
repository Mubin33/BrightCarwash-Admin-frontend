"use client";

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { FilterDropdown } from '@/components/ui/FilterDropdown';
import { FAQRow } from './FAQRow';
import { FAQModal } from './FAQModal';
import { useGetFAQsQuery, useDeleteFAQMutation, useReorderFAQsMutation } from '@/services/faq.api';
import type { FAQ } from '@/types/faq';
import { toast } from 'react-toastify';
import { PERMISSIONS } from '@/lib/permissions';

const STATUS_OPTIONS = [
    { value: 'true', label: 'Published' },
    { value: 'false', label: 'Draft' },
];

const SORT_OPTIONS = [
    { value: 'created_at_desc', label: 'Newest first' },
    { value: 'created_at_asc', label: 'Oldest first' },
];

export function FAQContent() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortFilter, setSortFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
    const [localFAQs, setLocalFAQs] = useState<FAQ[]>([]);

    const { data: faqs = [], isLoading, refetch } = useGetFAQsQuery({
        search: searchQuery || undefined,
        is_active: statusFilter ? statusFilter === 'true' : undefined,
        sort_by: sortFilter.includes('created_at') ? 'created_at' : 'display_order',
        sort_order: sortFilter.includes('desc') ? 'desc' : 'asc',
        limit: 100,
    });

    const [deleteFAQ] = useDeleteFAQMutation();
    const [reorderFAQs] = useReorderFAQsMutation();

    // Update local FAQs when data changes
    useEffect(() => {
        setLocalFAQs(faqs);
    }, [faqs]);

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            setSearchQuery(searchInput);
        }
    };

    const handleSearchClick = () => {
        setSearchQuery(searchInput);
    };

    const handleEdit = (faq: FAQ) => {
        setEditingFAQ(faq);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this FAQ?')) return;
        try {
            await deleteFAQ(id).unwrap();
            toast.success('FAQ deleted successfully');
            refetch();
        } catch {
            toast.error('Failed to delete FAQ');
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingFAQ(null);
    };

    const handleModalSuccess = () => {
        refetch();
        handleModalClose();
    };

    const handleDragEnd = async (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(localFAQs);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        const updatedItems = items.map((item, index) => ({
            ...item,
            display_order: index + 1,
        }));

        setLocalFAQs(updatedItems);

        // Send reorder request
        try {
            await reorderFAQs({
                faqs: updatedItems.map((item) => ({
                    id: item.id,
                    display_order: item.display_order,
                })),
            }).unwrap();
            toast.success('Order updated successfully');
        } catch {
            toast.error('Failed to update order');
            setLocalFAQs(faqs);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full flex flex-col gap-4">
                <div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
            </div>
        );
    }

    return (
        <div className="flex w-full max-w-full flex-col items-start p-4">
            {/* Header */}
            <div className="flex justify-between items-center self-stretch">
                <h2 className="text-[#1D1F2C] font-inter text-xl font-semibold leading-[100%]">
                    FAQ Section
                </h2>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    permission={PERMISSIONS.faq.create}
                    className="w-auto! flex py-2.5 px-4 justify-center items-center gap-2 rounded bg-[#0098E8] text-white font-inter text-sm hover:bg-[#0088D8] transition-colors"
                >
                    <Icon name="plus" width={16} height={16} color="white" />
                    Add New
                </Button>
            </div>

            <div className="h-6" /> {/* 24px gap */}

            {/* Filters */}
            <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap self-stretch">
                {/* Search Input with Button */}
                <div className="flex flex-1 min-w-[200px] max-w-[400px]">
                    <div className="relative flex-1 min-w-[200px] max-w-[400px]">
                        <input
                            type="text"
                            placeholder="Search FAQs..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            className="w-full pl-4 pr-12 py-3 border border-[#E8E8E9] rounded-lg bg-white text-sm text-[#1B1B1B] placeholder-[#777980] font-inter outline-none focus:border-[#0098E8]"
                        />
                        <Button
                            variant="icon"
                            onClick={handleSearchClick}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md bg-[#0098E8] hover:bg-[#0088D8] transition-colors"
                        >
                            <Icon name="search" width={16} height={16} color="white" />
                        </Button>
                    </div>
                </div>

                <FilterDropdown
                    label="All Status"
                    options={STATUS_OPTIONS}
                    value={statusFilter}
                    onChange={setStatusFilter}
                />

                <FilterDropdown
                    label="Sort by"
                    options={SORT_OPTIONS}
                    value={sortFilter}
                    onChange={setSortFilter}
                />
            </div>

            <div className="h-4" /> {/* 16px gap */}

            {/* Table */}
            <div className="w-full rounded-xl border border-[#DFE1E7] overflow-hidden bg-white">
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="faqs">
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="flex flex-col w-full"
                            >
                                {localFAQs.length === 0 ? (
                                    <div className="flex items-center justify-center py-12 text-[#777980] font-inter text-sm">
                                        No FAQs found. Add your first FAQ!
                                    </div>
                                ) : (
                                    localFAQs.map((faq, index) => (
                                        <FAQRow
                                            key={faq.id}
                                            faq={faq}
                                            index={index}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                        />
                                    ))
                                )}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>

            {/* Add/Edit Modal */}
            <FAQModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                faq={editingFAQ}
                onSuccess={handleModalSuccess}
            />
        </div>
    );
}