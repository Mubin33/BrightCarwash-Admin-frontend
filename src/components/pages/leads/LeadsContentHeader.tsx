'use client';

import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { ViewToggle } from '@/components/pages/leads/ViewToggle';
import { AssignmentToggle } from '@/components/pages/leads/AssignmentToggle';
import { ChevronDown } from 'lucide-react';
import { PERMISSIONS } from '@/lib/permissions';

interface LeadsContentHeaderProps {
    selectedCount: number;
    isExportOpen: boolean;
    setIsExportOpen: (val: boolean) => void;
    exportRef: React.RefObject<HTMLDivElement | null>;
    handleExportExcel: () => void;
    handleExportCSV: () => void;
    handleNewGroupClick: () => void;
    setModalOpen: (val: boolean) => void;
    viewMode: 'list' | 'kanban';
    setViewMode: (val: 'list' | 'kanban') => void;
    leadType: 'all' | 'mine';
    setLeadType: (val: 'all' | 'mine') => void;

}

export function LeadsContentHeader({
    selectedCount,
    isExportOpen,
    setIsExportOpen,
    exportRef,
    handleExportExcel,
    handleExportCSV,
    handleNewGroupClick,
    setModalOpen,
    viewMode,
    setViewMode,
    leadType,
    setLeadType,

}: LeadsContentHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end text-center gap-2 sm:gap-3 self-stretch">
            <h2 className="text-[#0B1220] font-lora text-xl sm:text-xl font-bold leading-[100%] shrink-0">
                {leadType === 'mine' ? 'My Leads' : 'All Leads'} Overview
            </h2>

            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3 shrink-0 w-full sm:w-auto">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div ref={exportRef} className="relative">
                        <Button
                            variant="outline"
                            className="flex py-2 sm:py-2.5 px-3 sm:px-4 justify-center items-center gap-1.5 sm:gap-2 rounded border border-[#DFE1E7] text-[#1B1B1B] font-inter text-xs sm:text-sm font-normal whitespace-nowrap"
                            onClick={() => setIsExportOpen(!isExportOpen)}
                            permission={PERMISSIONS.lead.export}
                        >
                            <Icon name="export" width={14} height={14} className="sm:w-4 sm:h-4" /> Export
                            <ChevronDown size={14} className={`transition-transform ${isExportOpen ? 'rotate-180' : ''}`} />
                        </Button>
                        {isExportOpen && (
                            <div className="absolute right-0 top-full mt-1 min-w-[180px] sm:min-w-[200px] bg-white rounded-lg border border-[#E8E8E9] shadow-lg z-50 overflow-hidden">
                                <button onClick={handleExportExcel} className="flex w-full py-2.5 px-4 items-center text-xs sm:text-sm text-[#1B1B1B] hover:bg-[#F8FAFB] transition-colors">Export as Excel (.xlsx)</button>
                                <button onClick={handleExportCSV} className="flex w-full py-2.5 px-4 items-center text-xs sm:text-sm text-[#1B1B1B] hover:bg-[#F8FAFB] transition-colors border-t border-[#E8E8E9]">Export as CSV (.csv)</button>
                            </div>
                        )}
                    </div>

                    {selectedCount >= 2 ? (
                        <Button
                            className="flex py-2 sm:py-2.5 px-3 sm:px-4 justify-center items-center gap-1.5 sm:gap-2 rounded bg-[#0098E8] text-white font-inter text-xs sm:text-sm font-normal hover:bg-[#0088D8] transition-colors whitespace-nowrap"
                            onClick={handleNewGroupClick}
                            permission={PERMISSIONS.lead_group.create}
                        >
                            New Group ({selectedCount})
                        </Button>
                    ) : (
                        <Button
                            className="flex py-2 sm:py-2.5 px-3 sm:px-4 justify-center items-center gap-1.5 sm:gap-2 rounded bg-[#0098E8] text-white font-inter text-xs sm:text-sm font-normal hover:bg-[#0088D8] transition-colors whitespace-nowrap"
                            onClick={() => setModalOpen(true)}
                            permission={PERMISSIONS.lead.create}
                        >
                            <Icon name="plus" width={14} height={14} className="sm:w-4 sm:h-4" /> New Lead
                        </Button>
                    )}
                </div>

                <div className="w-px h-8 bg-[#DFE1E7] hidden sm:block" />
                <AssignmentToggle leadType={leadType} onChange={setLeadType} />
                <div className="w-px h-8 bg-[#DFE1E7] hidden sm:block" />
                <ViewToggle viewMode={viewMode} onChange={setViewMode} />
            </div>
        </div>
    );
}