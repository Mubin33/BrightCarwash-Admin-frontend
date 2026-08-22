"use client";

import { FilterDropdown } from "@/components/ui/FilterDropdown";

const DEFAULT_LIMIT_OPTIONS = [
    { value: '10', label: '10' },
    { value: '20', label: '20' },
    { value: '50', label: '50' },
    { value: '100', label: '100' },
];

interface LimitSelectorProps {
    limit: number;
    onLimitChange: (value: number) => void;
    options?: { value: string; label: string }[];
}

export function LimitSelector({ limit, onLimitChange, options }: LimitSelectorProps) {
    return (
        <FilterDropdown
            label="Show"
            options={options || DEFAULT_LIMIT_OPTIONS}
            value={String(limit)}
            onChange={(val: string) => onLimitChange(Number(val))}
            dropdownOffsetX={-80}
        />
    );
}