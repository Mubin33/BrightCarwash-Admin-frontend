'use client';

interface CampaignViewCreatedAtProps {
    createdAt: string;
}

export function CampaignViewCreatedAt({ createdAt }: CampaignViewCreatedAtProps) {
    return (
        <div className="flex flex-col gap-2">
            <div className="text-zinc-500 text-base font-normal font-['Inter'] leading-5">
                Created
            </div>
            <div className="w-full p-4 bg-gray-50 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 text-neutral-600 text-base font-normal font-['Inter'] leading-6">
                {new Date(createdAt).toLocaleString()}
            </div>
        </div>
    );
}