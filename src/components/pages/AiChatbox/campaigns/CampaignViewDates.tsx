'use client';

import { DatePicker } from '@/components/ui/DatePicker';

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
                    <DatePicker
                        value={startDate}
                        onChange={onStartDateChange}
                        placeholder="Select start date"
                        disabled={isUpdating}
                    />
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
                    <DatePicker
                        value={endDate}
                        onChange={onEndDateChange}
                        placeholder="Select end date"
                        disabled={isUpdating}
                    />
                ) : (
                    <div className="w-full p-4 bg-gray-50 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 text-neutral-600 text-base font-normal font-['Inter'] leading-6">
                        {formatDate(endDate || null)}
                    </div>
                )}
            </div>
        </div>
    );
}