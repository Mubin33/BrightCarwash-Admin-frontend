"use client";

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { PERMISSIONS } from '@/lib/permissions';

interface TestimonialsHeaderProps {
    onAddClick: () => void;
}

export function TestimonialsHeader({ onAddClick }: TestimonialsHeaderProps) {
    return (
        <div className="flex justify-between items-center">
            <h2 className="text-[#1D1F2C] font-inter text-xl font-semibold leading-5">
                Testimonials
            </h2>
            <Button
                onClick={onAddClick}
                permission={PERMISSIONS.testimonial.create}
                className="w-auto! flex py-2.5 px-4 items-center gap-2 rounded bg-[#0098E8] text-white font-inter text-sm hover:bg-[#0088D8] transition-colors"
            >
                Add New
                <Icon name="plus" width={16} height={16} color="white" />
            </Button>
        </div>
    );
}