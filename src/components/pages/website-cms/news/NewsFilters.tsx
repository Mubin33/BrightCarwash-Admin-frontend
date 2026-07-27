'use client';

import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { FilterDropdown } from '@/components/ui/FilterDropdown';

const STATUS_OPTIONS = [
    { value: 'true', label: 'Published' },
    { value: 'false', label: 'Draft' },
];

const SORT_OPTIONS = [
    { value: 'created_at_desc', label: 'Newest' },
    { value: 'created_at_asc', label: 'Oldest' },
];

interface NewsFiltersProps {
    searchInput: string;
    onSearchChange: (value: string) => void;
    onSearchSubmit: () => void;
    onSearchKeyDown: (e: React.KeyboardEvent) => void;
    statusFilter: string;
    onStatusChange: (value: string) => void;
    categoryFilter: string;
    onCategoryChange: (value: string) => void;
    categories: { id: string; name: string }[];
    sortFilter: string;
    onSortChange: (value: string) => void;
    viewMode: 'grid' | 'list';
    onViewModeChange: (mode: 'grid' | 'list') => void;
}

export function NewsFilters({
    searchInput,
    onSearchChange,
    onSearchSubmit,
    onSearchKeyDown,
    statusFilter,
    onStatusChange,
    categoryFilter,
    onCategoryChange,
    categories,
    sortFilter,
    onSortChange,
    viewMode,
    onViewModeChange,
}: NewsFiltersProps) {
    const categoryOptions = [
        ...categories.map((c) => ({ value: c.id, label: c.name })),
    ];

    return (
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="flex">
                    <div className="relative w-56">
                        <input
                            type="text"
                            placeholder="Search posts..."
                            value={searchInput}
                            onChange={(e) => onSearchChange(e.target.value)}
                            onKeyDown={onSearchKeyDown}
                            className="w-full pl-4 pr-12 py-3 border border-[#E8E8E9] rounded-lg bg-white text-sm text-[#1B1B1B] placeholder-[#777980] font-inter outline-none focus:border-[#0098E8]"
                        />
                        <Button
                            variant="icon"
                            onClick={onSearchSubmit}
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
                    onChange={onStatusChange}
                />

                <FilterDropdown
                    label="All Categories"
                    options={categoryOptions}
                    value={categoryFilter}
                    onChange={onCategoryChange}
                />

                <FilterDropdown
                    label="Sort by"
                    options={SORT_OPTIONS}
                    value={sortFilter}
                    onChange={onSortChange}
                />
            </div>

            {/* FIX: Icon centering */}
            <div className="flex p-1 bg-[#F1F1F1] rounded-lg border border-[#DFE1E7]">
                <button
                    type="button"
                    onClick={() => onViewModeChange('grid')}
                    className={`p-2 rounded-md transition-colors flex items-center justify-center ${viewMode === 'grid'
                            ? 'bg-white shadow-[0_4px_4px_0_rgba(0,0,0,0.05)]'
                            : 'hover:bg-white/50'
                        }`}
                >
                    <Icon
                        name="grid"
                        width={20}
                        height={20}
                        color={viewMode === 'grid' ? '#1B1B1B' : '#777980'}
                    />
                </button>
                <button
                    type="button"
                    onClick={() => onViewModeChange('list')}
                    className={`p-2 rounded-md transition-colors flex items-center justify-center ${viewMode === 'list'
                            ? 'bg-white shadow-[0_4px_4px_0_rgba(0,0,0,0.05)]'
                            : 'hover:bg-white/50'
                        }`}
                >
                    <Icon
                        name="list"
                        width={20}
                        height={20}
                        color={viewMode === 'list' ? '#1B1B1B' : '#777980'}
                    />
                </button>
            </div>
        </div>
    );
}