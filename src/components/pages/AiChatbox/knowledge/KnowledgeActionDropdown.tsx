'use client';

import { useState, useRef, useEffect } from 'react';
import { Icon } from '@/components/ui/Icon';
import { MoreHorizontal, Eye, Trash2 } from 'lucide-react';

interface KnowledgeActionDropdownProps {
    onView: () => void;
    onDelete: () => void;
    isDeleting: boolean;
}

export function KnowledgeActionDropdown({
    onView,
    onDelete,
    isDeleting,
}: KnowledgeActionDropdownProps) {
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
                className="p-1.5 bg-white rounded-md outline outline-1 outline-offset-[-1px] outline-gray-200 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
                disabled={isDeleting}
            >
                <MoreHorizontal size={16} className="text-gray-600" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <button
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                        onClick={() => {
                            setIsOpen(false);
                            onView();
                        }}
                    >
                        <Eye size={16} />
                        View Document
                    </button>
                    <button
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                        onClick={() => {
                            setIsOpen(false);
                            onDelete();
                        }}
                        disabled={isDeleting}
                    >
                        <Trash2 size={16} />
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}