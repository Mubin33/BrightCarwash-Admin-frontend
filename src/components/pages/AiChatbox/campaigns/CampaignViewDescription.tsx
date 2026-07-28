'use client';

interface CampaignViewDescriptionProps {
    description: string;
    isEditing: boolean;
    isUpdating: boolean;
    onDescriptionChange: (value: string) => void;
}

export function CampaignViewDescription({
    description,
    isEditing,
    isUpdating,
    onDescriptionChange,
}: CampaignViewDescriptionProps) {
    return (
        <div className="flex flex-col gap-2">
            <div className="text-zinc-500 text-base font-normal font-['Inter'] leading-5">
                Campaign Description
            </div>
            {isEditing ? (
                <>
                    <textarea
                        value={description}
                        onChange={(e) => onDescriptionChange(e.target.value)}
                        placeholder="Enter campaign description"
                        disabled={isUpdating}
                        maxLength={300}
                        rows={4}
                        className="w-full p-4 bg-gray-50 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 text-neutral-600 text-base font-normal font-['Inter'] leading-6 placeholder:text-neutral-400 focus:outline-2 focus:outline-sky-500 disabled:opacity-50 resize-none"
                    />
                    <div className="text-right text-zinc-500 text-base font-normal font-['Inter'] leading-5">
                        {description.length}/300
                    </div>
                </>
            ) : (
                <div className="w-full p-4 bg-gray-50 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 text-neutral-600 text-base font-normal font-['Inter'] leading-6 min-h-[100px]">
                    {description}
                </div>
            )}
        </div>
    );
}