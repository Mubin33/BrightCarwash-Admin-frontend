'use client';

import { useState, useRef, useEffect } from 'react';
import { Icon } from '@/components/ui/Icon';
import { ChevronDown } from 'lucide-react';

interface CampaignFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
    sortBy: string;
    onSortByChange: (value: string) => void;
}

const statusOptions = ['All Status', 'Active', 'Inactive'];
const sortOptions = ['Newest First', 'Oldest First'];

interface DropdownProps {
    label: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
}

function FilterDropdown({ label, options, value, onChange }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="px-4 py-3 bg-white rounded-lg shadow-[inset_0px_-2px_0px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] outline-zinc-200 flex items-center gap-2 min-w-[140px] justify-between hover:bg-gray-50 transition-colors"
            >
                <span className="text-neutral-600 text-sm font-normal font-['Inter'] leading-4">
                    {value}
                </span>
                <ChevronDown size={16} className={`text-neutral-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    {options.map((option) => (
                        <button
                            key={option}
                            onClick={() => {
                                onChange(option);
                                setIsOpen(false);
                            }}
                            className={`w-full px-4 py-2 text-left text-sm font-['Inter'] transition-colors ${option === value
                                    ? 'bg-sky-50 text-sky-700'
                                    : 'text-neutral-600 hover:bg-gray-50'
                                }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export function CampaignFilters({
    searchTerm,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    sortBy,
    onSortByChange,
}: CampaignFiltersProps) {
    return (
        <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="px-4 py-3 bg-white rounded-lg shadow-[inset_0px_-2px_0px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] outline-zinc-200 flex items-center gap-3 w-full sm:w-auto">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search campaigns…"
                    className="text-neutral-600 text-sm font-normal font-['Inter'] leading-4 outline-none bg-transparent w-full sm:w-48"
                />
                <Icon name="search" width={20} height={20} />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <FilterDropdown
                    label="Status"
                    options={statusOptions}
                    value={statusFilter}
                    onChange={onStatusFilterChange}
                />
                <FilterDropdown
                    label="Sort"
                    options={sortOptions}
                    value={sortBy}
                    onChange={onSortByChange}
                />
            </div>
        </div>
    );
}