'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
    color: string;
    label: string;
    visible: boolean;
    onToggle: () => void;
}

export function StageFilterButton({ color, label, visible, onToggle }: Props) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 rounded-full border border-[#DFE1E7] px-4 py-2 text-sm font-medium text-[#1B1B1B] hover:bg-[#F8FAFB] transition-colors"
            >
                <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: color, opacity: visible ? 1 : 0.3 }}
                />
                <span className={visible ? '' : 'text-[#777980]'}>{label}</span>
                <ChevronDown className={`h-4 w-4 text-[#777980] transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute right-0 z-50 mt-2 w-40 rounded-lg border border-[#E8E8E9] bg-white p-1 shadow-lg">
                    <Button
                        variant="icon"
                        onClick={() => { onToggle(); setOpen(false); }}
                        className="w-full rounded-md px-3 py-2 text-left text-sm text-[#1B1B1B] hover:bg-[#F8FAFB]"
                    >
                        {visible ? 'Hide series' : 'Show series'}
                    </Button>
                </div>
            )}
        </div>
    );
}