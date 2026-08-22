'use client';

import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';

type LeadType = 'all' | 'mine';

interface AssignmentToggleProps {
    leadType: LeadType;
    onChange: (type: LeadType) => void;
}

export function AssignmentToggle({ leadType, onChange }: AssignmentToggleProps) {
    const toggleRef = useRef<HTMLDivElement>(null);
    const [sliderStyle, setSliderStyle] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!toggleRef.current) return;
        const timer = requestAnimationFrame(() => {
            if (!toggleRef.current) return;
            const selector = leadType === 'mine' ? 'button:first-of-type' : 'button:last-of-type';
            const activeBtn = toggleRef.current.querySelector(selector) as HTMLElement;
            if (activeBtn) {
                setSliderStyle({
                    left: `${activeBtn.offsetLeft}px`,
                    width: `${activeBtn.offsetWidth}px`,
                });
            }
        });
        return () => cancelAnimationFrame(timer);
    }, [leadType]);

    return (
        <div
            ref={toggleRef}
            className="relative flex p-1 items-center gap-0.5 rounded-lg border border-[#DFE1E7] bg-[#F6F6F6]"
        >
            <div
                className="absolute top-1 h-[calc(100%-8px)] rounded-md bg-[#B23730] shadow-[0_4px_4px_0_rgba(0,0,0,0.05)] transition-all duration-300 ease-in-out z-0"
                style={sliderStyle}
            />
            <Button
                variant="icon"
                onClick={() => onChange('mine')}
                className={`relative z-10 flex py-2 px-3 justify-center items-center gap-1 rounded-md text-sm font-inter transition-colors duration-200 whitespace-nowrap w-auto! ${leadType === 'mine' ? 'text-white' : 'text-[#1B1B1B]'}`}
            >
                My Leads
            </Button>
            <Button
                variant="icon"
                onClick={() => onChange('all')}
                className={`relative z-10 flex py-2 px-3 justify-center items-center gap-1 rounded-md text-sm font-inter transition-colors duration-200 whitespace-nowrap w-auto! ${leadType === 'all' ? 'text-white' : 'text-[#1B1B1B]'}`}
            >
                All Leads
            </Button>
        </div>
    );
}