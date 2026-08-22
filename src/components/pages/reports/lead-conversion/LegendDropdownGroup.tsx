'use client';

import { FilterDropdown } from '@/components/ui/FilterDropdown';

interface StageDef {
    name: string;
    color: string;
    label: string;
}

interface Props {
    stages: StageDef[];
    visibleStages: string[];
    onToggle: (stage: string) => void;
}

export function LegendDropdownGroup({ stages, visibleStages, onToggle }: Props) {
    return (
        <div className="flex items-center gap-2">
            {stages.map((s) => (
                <FilterDropdown
                    key={s.name}
                    label={s.label}
                    options={[
                        { value: s.name, label: 'Show' },
                        { value: '', label: 'Hide' },
                    ]}
                    value={visibleStages.includes(s.name) ? s.name : ''}
                    onChange={(val) => { if (val !== undefined) onToggle(s.name); }}
                    buttonClassName="pl-2 pr-3 py-1 rounded border border-[#DFE1E7] bg-white text-xs font-inter flex items-center gap-2"
                />
            ))}
        </div>
    );
}