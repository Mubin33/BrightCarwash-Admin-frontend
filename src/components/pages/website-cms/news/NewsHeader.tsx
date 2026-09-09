"use client";

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { PERMISSIONS } from '@/lib/permissions';

interface NewsHeaderProps {
    onCategoryClick: () => void;
    onAddClick: () => void;
}

export function NewsHeader({ onCategoryClick, onAddClick }: NewsHeaderProps) {
    return (
        <div className="flex justify-between items-center">
            <h2 className="text-[#1D1F2C] font-inter text-xl font-semibold leading-5">
                News & Blog
            </h2>
            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    onClick={onCategoryClick}
                    permission={PERMISSIONS.news_category.create}
                    className="py-2.5 px-4 text-[#777980]"
                >
                    Manage Categories
                </Button>
                <Button
                    onClick={onAddClick}
                    permission={PERMISSIONS.news_and_events.create}
                    className="flex py-2.5 px-4 items-center gap-2 rounded bg-[#0098E8] text-white font-inter text-sm hover:bg-[#0088D8] transition-colors"
                >
                    Add New
                    <Icon name="plus" width={16} height={16} color="white" />
                </Button>
            </div>
        </div>
    );
}