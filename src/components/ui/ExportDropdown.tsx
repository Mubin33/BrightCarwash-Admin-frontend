'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

interface ExportOption {
    label: string;
    onClick: () => void;
}

interface ExportDropdownProps {
    options: ExportOption[];
    trigger?: ReactNode;
    className?: string;
}

export function ExportDropdown({ options, trigger, className = '' }: ExportDropdownProps) {
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

    const defaultTrigger = (
        <Button
            variant="outline"
            className={`flex py-2.5 px-4 items-center gap-2 rounded border border-[#DFE1E7] text-[#1B1B1B] font-inter text-sm w-auto ${className}`}
            onClick={() => setIsOpen(!isOpen)}
        >
            <Icon name="export" width={14} height={14} /> Export
            <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
    );

    return (
        <div ref={dropdownRef} className="relative">
            <div onClick={() => setIsOpen(!isOpen)}>
                {trigger || defaultTrigger}
            </div>

            {isOpen && (
                <div className="absolute right-0 top-full mt-1 min-w-[180px] bg-white rounded-lg border border-[#E8E8E9] shadow-lg z-50 overflow-hidden">
                    {options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                option.onClick();
                                setIsOpen(false);
                            }}
                            className={`flex w-full py-2.5 px-4 items-center text-sm text-[#1B1B1B] hover:bg-[#F8FAFB] transition-colors ${index > 0 ? 'border-t border-[#E8E8E9]' : ''
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}