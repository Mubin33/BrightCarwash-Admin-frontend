import { describe, it, expect } from 'vitest';
import { resolveDefaultStage } from './stage-utils';
import type { StageOption } from '@/components/ui/StageDropdown';

describe('stage-utils (BUG-013)', () => {
    const mockStages: StageOption[] = [
        { value: 'new', label: 'New Lead', color: '#0098E8', stageId: 'stage-uuid-1' },
        { value: 'contacted', label: 'Contacted', color: '#FFA500', stageId: 'stage-uuid-2' },
        { value: 'converted', label: 'Converted', color: '#00C853', stageId: 'stage-uuid-3' },
    ];

    it('defaults to the first stage in the database when no preferred stage is given', () => {
        const result = resolveDefaultStage(mockStages);
        expect(result.stageId).toBe('stage-uuid-1');
        expect(result.stageLabel).toBe('New Lead');
    });

    it('uses preferredStageId when it matches a stage in the list (e.g. from Kanban column)', () => {
        const result = resolveDefaultStage(mockStages, 'stage-uuid-2', 'Contacted');
        expect(result.stageId).toBe('stage-uuid-2');
        expect(result.stageLabel).toBe('Contacted');
    });

    it('returns empty stageId and "Select Stage" when stages array is empty or undefined', () => {
        const result = resolveDefaultStage([]);
        expect(result.stageId).toBe('');
        expect(result.stageLabel).toBe('Select Stage');

        const resultUndefined = resolveDefaultStage(undefined);
        expect(resultUndefined.stageId).toBe('');
        expect(resultUndefined.stageLabel).toBe('Select Stage');
    });

    it('preserves preferredStageId if stages are still loading', () => {
        const result = resolveDefaultStage([], 'custom-stage-id', 'Custom Stage');
        expect(result.stageId).toBe('custom-stage-id');
        expect(result.stageLabel).toBe('Custom Stage');
    });

    it('never contains the hardcoded CUID "cmqhw9c130002q4tmw3f71hpt"', () => {
        const emptyResult = resolveDefaultStage([]);
        expect(emptyResult.stageId).not.toBe('cmqhw9c130002q4tmw3f71hpt');
    });
});
