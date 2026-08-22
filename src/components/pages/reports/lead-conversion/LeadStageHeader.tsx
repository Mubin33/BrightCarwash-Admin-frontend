'use client';

import { StageFilterButton } from './StageFilterButton';
import type { StageVisibility } from '@/types/reports';

const STAGE_META = [
    { key: 'converted', label: 'Converted', color: '#0f7a3c' },
    { key: 'contacted', label: 'Contacted', color: '#f5a623' },
    { key: 'lost', label: 'Lost', color: '#f74646' },
] as const;

interface Props {
    visibility: StageVisibility;
    onToggleStage: (key: string) => void;
}

export function LeadStageHeader({ visibility, onToggleStage }: Props) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-[#1A1C21] font-inter text-lg font-semibold">
                Lead stage breakdown
            </h3>
            <div className="flex flex-wrap items-center gap-3">
                {STAGE_META.map((stage) => (
                    <StageFilterButton
                        key={stage.key}
                        color={stage.color}
                        label={stage.label}
                        visible={visibility[stage.key]}
                        onToggle={() => onToggleStage(stage.key)}
                    />
                ))}
            </div>
        </div>
    );
}