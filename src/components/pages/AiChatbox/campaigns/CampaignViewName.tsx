'use client';

interface CampaignViewNameProps {
    title: string;
    isEditing: boolean;
    isUpdating: boolean;
    onTitleChange: (value: string) => void;
}

export function CampaignViewName({
    title,
    isEditing,
    isUpdating,
    onTitleChange,
}: CampaignViewNameProps) {
    return (
        <div className="flex flex-col gap-2">
            <div className="text-zinc-500 text-base font-normal font-['Inter'] leading-5">
                Campaign Name
            </div>
            {isEditing ? (
                <input
                    type="text"
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder="Enter campaign name"
                    disabled={isUpdating}
                    className="w-full p-4 bg-gray-50 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 text-neutral-600 text-base font-normal font-['Inter'] leading-6 placeholder:text-neutral-400 focus:outline-2 focus:outline-sky-500 disabled:opacity-50"
                />
            ) : (
                <div className="w-full p-4 bg-gray-50 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 text-neutral-600 text-base font-normal font-['Inter'] leading-6">
                    {title}
                </div>
            )}
        </div>
    );
}