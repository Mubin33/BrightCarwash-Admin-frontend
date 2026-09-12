"use client";

import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import type { ActivityLog } from '@/types/activity-log';

interface ActivityLogRowProps {
    log: ActivityLog;
}

const actionColors: Record<string, string> = {
    create: 'text-[#006F1F]',
    update: 'text-[#0098E8]',
    delete: 'text-[#FF4345]',
    invite: 'text-[#FFAF00]',
    read: 'text-[#777980]',
};

const entityColors: Record<string, string> = {
    lead: 'bg-[#EBF5FF] text-[#0098E8]',
    staff: 'bg-[#DCF7EA] text-[#006F1F]',
    stage: 'bg-[#FFF7E6] text-[#FFAF00]',
    campaign: 'bg-[#F3E8FF] text-[#7C3AED]',
    role: 'bg-[#FFE6E6] text-[#FF4345]',
};

export function ActivityLogRow({ log }: ActivityLogRowProps) {
    const timeAgo = formatDistanceToNow(new Date(log.createdAt), { addSuffix: true });

    // Extract user name from metadata or use fallback
    const userName = log.userId ? 'Admin User' : 'System';

    return (
        <tr className="border-t border-[#E8E8E9] bg-white hover:bg-[#F8FAFB] transition-colors">
            {/* User */}
            <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-[#F1F1F1] flex items-center justify-center text-[#777980] text-sm font-medium">
                        {userName.charAt(0)}
                    </div>
                    <span className="text-[#1B1B1B] font-inter text-sm font-medium">
                        {userName}
                    </span>
                </div>
            </td>

            {/* Action */}
            <td className="py-3 px-4">
                <div className="flex flex-col gap-1">
                    <span className="text-[#1D1F2C] font-inter text-sm font-medium leading-[100%]">
                        {log.description}
                    </span>
                    <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium capitalize ${actionColors[log.action] || 'text-[#777980]'}`}>
                            {log.action}
                        </span>
                        <span className="text-[#777980] text-xs">•</span>
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${entityColors[log.entity] || 'bg-[#F8FAFB] text-[#777980]'}`}>
                            {log.entity}
                        </span>
                    </div>
                </div>
            </td>

            {/* Time */}
            <td className="py-3 px-4 text-[#777980] font-inter text-sm whitespace-nowrap">
                {timeAgo}
            </td>
        </tr>
    );
}