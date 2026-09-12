"use client";

import type { ActivityLog } from '@/types/activity-log';
import { ActivityLogRow } from './ActivityLogRow';

interface ActivityLogTableProps {
    logs: ActivityLog[];
    isLoading?: boolean;
}

export function ActivityLogTable({ logs, isLoading }: ActivityLogTableProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-[#0098E8] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="flex items-center justify-center py-12 text-[#777980] font-inter text-sm">
                No activity logs found.
            </div>
        );
    }

    return (
        <div className="w-full overflow-x-auto rounded-lg border border-[#E8E8E9]">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-[#F1F1F1]">
                        <th className="py-2.5 px-4 text-left text-[#777980] font-inter text-xs font-medium uppercase tracking-wider w-[180px]">
                            User
                        </th>
                        <th className="py-2.5 px-4 text-left text-[#777980] font-inter text-xs font-medium uppercase tracking-wider">
                            Action
                        </th>
                        <th className="py-2.5 px-4 text-left text-[#777980] font-inter text-xs font-medium uppercase tracking-wider w-[160px]">
                            Time
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log) => (
                        <ActivityLogRow key={log.id} log={log} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}