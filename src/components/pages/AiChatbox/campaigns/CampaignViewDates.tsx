'use client';

import { Calendar } from 'lucide-react';

interface CampaignViewDatesProps {
    startDate: string;
    endDate: string;
    isEditing: boolean;
    isUpdating: boolean;
    onStartDateChange: (value: string) => void;
    onEndDateChange: (value: string) => void;
}

const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Ongoing';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export function CampaignViewDates({
    startDate,
    endDate,
    isEditing,
    isUpdating,
    onStartDateChange,
    onEndDateChange,
}: CampaignViewDatesProps) {
    return (
        <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-2">
                <div className="text-zinc-500 text-base font-normal font-['Inter'] leading-5">
                    Starting Date
                </div>
                {isEditing ? (
                    <div className="relative">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => onStartDateChange(e.target.value)}
                            disabled={isUpdating}
                            className="w-full p-4 bg-gray-50 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 text-neutral-600 text-base font-normal font-['Inter'] leading-6 focus:outline-2 focus:outline-sky-500 disabled:opacity-50 appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                        />
                        <Calendar size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                ) : (
                    <div className="w-full p-4 bg-gray-50 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 text-neutral-600 text-base font-normal font-['Inter'] leading-6">
                        {formatDate(startDate || null)}
                    </div>
                )}
            </div>
            <div className="flex-1 flex flex-col gap-2">
                <div className="text-zinc-500 text-base font-normal font-['Inter'] leading-5">
                    Ending Date
                </div>
                {isEditing ? (
                    <div className="relative">
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => onEndDateChange(e.target.value)}
                            disabled={isUpdating}
                            className="w-full p-4 bg-gray-50 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 text-neutral-600 text-base font-normal font-['Inter'] leading-6 focus:outline-2 focus:outline-sky-500 disabled:opacity-50 appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                        />
                        <Calendar size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                ) : (
                    <div className="w-full p-4 bg-gray-50 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 text-neutral-600 text-base font-normal font-['Inter'] leading-6">
                        {formatDate(endDate || null)}
                    </div>
                )}
            </div>
        </div>
    );
}