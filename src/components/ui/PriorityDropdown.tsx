"use client";

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { getPriorityConfig } from '@/lib/priority-utils';

interface PriorityOption {
    value: string;
    label: string;
}

interface PriorityDropdownProps {
    currentPriority: string;
    options: PriorityOption[];
    onSelect: (priority: string) => void;
}

const PRIORITY_COLORS: Record<string, { color: string; bg: string; icon: string }> = {
    LOW: { color: '#777980', bg: 'rgba(119, 121, 128, 0.12)', icon: 'arrow-down' },
    MEDIUM: { color: '#FFAF00', bg: 'rgba(255, 175, 0, 0.12)', icon: 'minus' },
    HIGH: { color: '#FF6B00', bg: 'rgba(255, 107, 0, 0.12)', icon: 'arrow-up' },
    URGENT: { color: '#FF4345', bg: 'rgba(255, 67, 69, 0.12)', icon: 'alert' },
};

const DROPDOWN_WIDTH = 140;
const GAP = 2;
const VIEWPORT_PADDING = 4;
const MAX_HEIGHT = 200;
const ITEM_HEIGHT = 36;
const EXTRA_HEIGHT = 8;

export function PriorityDropdown({
    currentPriority,
    options,
    onSelect,
}: PriorityDropdownProps) {
    const [open, setOpen] = useState(false);
    const [dropdownStyle, setDropdownStyle] = useState<Record<string, string>>({});
    const ref = useRef<HTMLDivElement>(null);
    const btnRef = useRef<HTMLDivElement>(null);
    const portalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (!open) return;
            const target = e.target as Node;
            if (portalRef.current?.contains(target) || ref.current?.contains(target)) {
                return;
            }
            setOpen(false);
        }
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [open]);

    useEffect(() => {
        if (open && btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            const estimatedHeight = Math.min(MAX_HEIGHT, options.length * ITEM_HEIGHT + EXTRA_HEIGHT);
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;

            let left = rect.left;
            left = Math.max(VIEWPORT_PADDING, Math.min(left, viewportWidth - DROPDOWN_WIDTH - VIEWPORT_PADDING));

            const spaceBelow = viewportHeight - rect.bottom;
            const spaceAbove = rect.top;
            const needsFlip = spaceBelow < estimatedHeight + GAP && spaceAbove > spaceBelow;

            let top: number;
            if (needsFlip) {
                top = rect.top - estimatedHeight - GAP;
                if (top < VIEWPORT_PADDING) top = VIEWPORT_PADDING;
            } else {
                top = rect.bottom + GAP;
                const maxTop = viewportHeight - estimatedHeight - VIEWPORT_PADDING;
                if (top > maxTop) top = maxTop;
            }

            setDropdownStyle({
                position: 'fixed',
                top: `${top}px`,
                left: `${left}px`,
                width: `${DROPDOWN_WIDTH}px`,
                maxHeight: `${estimatedHeight}px`,
                overflowY: 'auto',
                zIndex: '9999',
            });
        }
    }, [open, options.length]);

    const currentConfig = PRIORITY_COLORS[currentPriority] || PRIORITY_COLORS.LOW;
    const currentLabel = options.find((o) => o.value === currentPriority)?.label || currentPriority;

    return (
        <div ref={ref} className='relative inline-block'>
            <div
                ref={btnRef}
                onClick={() => setOpen(!open)}
                className='inline-flex py-1.5 pl-2 pr-1 justify-center items-center gap-1 rounded text-xs font-medium capitalize cursor-pointer'
                style={{ backgroundColor: currentConfig.bg, color: currentConfig.color }}
            >

                {currentLabel}
                <ChevronDown size={12} style={{ color: currentConfig.color, opacity: 0.7 }} />
            </div>

            {open && createPortal(
                <div
                    ref={portalRef}
                    className='bg-white rounded-lg border border-[#E8E8E9] shadow-lg overflow-hidden'
                    style={dropdownStyle}
                >
                    {options.map((option) => {
                        const isSelected = option.value === currentPriority;
                        const config = PRIORITY_COLORS[option.value] || PRIORITY_COLORS.LOW;

                        return (
                            <Button
                                key={option.value}
                                variant='icon'
                                onClick={() => {
                                    onSelect(option.value);
                                    setOpen(false);
                                }}
                                className={`flex w-full py-2.5 px-4 items-center gap-2 text-xs font-medium capitalize cursor-pointer transition-colors ${isSelected
                                    ? 'bg-[#0098E8] text-white'
                                    : 'text-[#1B1B1B] hover:bg-[#F8FAFB]'
                                    }`}
                            >
                                <Icon
                                    name={config.icon}
                                    width={14}
                                    height={14}
                                    color={isSelected ? '#FFFFFF' : config.color}
                                />
                                {option.label}
                            </Button>
                        );
                    })}
                </div>,
                document.body
            )}
        </div>
    );
}