import { useCallback } from 'react';
import { useExportLeadsMutation } from '@/services/leads.api';
import { toast } from 'react-toastify';
import type { Lead } from '@/types/leads';

export function useLeadsExport(
    leads: Lead[],
    selectedIds: Set<string>,
    filters: {
        search?: string;
        source?: string;
        depositStatus?: string;
        stageId?: string;
        assignedToId?: string;
        priority?: string;
        stageName?: string;
        dateFrom?: string;
        dateTo?: string;
        sortBy?: string;
        sortOrder?: string;
    }
) {
    const [exportLeads] = useExportLeadsMutation();

    const exportExcel = useCallback(async () => {
        try {
            const leadIds = selectedIds.size > 0 ? Array.from(selectedIds) : undefined;

            const result = await exportLeads({
                format: 'xlsx',
                leadIds,
                ...filters,
            }).unwrap();

            if (result.success) {
                const count = leadIds?.length || 'all';
                toast.success(`Exported ${count} leads as Excel`);
            }
        } catch (error: any) {
            toast.error(error?.data || 'Failed to export as Excel');
        }
    }, [exportLeads, selectedIds, filters]);

    const exportCSV = useCallback(async () => {
        try {
            const leadIds = selectedIds.size > 0 ? Array.from(selectedIds) : undefined;

            const result = await exportLeads({
                format: 'csv',
                leadIds,
                ...filters,
            }).unwrap();

            if (result.success) {
                const count = leadIds?.length || 'all';
                toast.success(`Exported ${count} leads as CSV`);
            }
        } catch (error: any) {
            toast.error(error?.data || 'Failed to export as CSV');
        }
    }, [exportLeads, selectedIds, filters]);

    return { exportExcel, exportCSV };
}