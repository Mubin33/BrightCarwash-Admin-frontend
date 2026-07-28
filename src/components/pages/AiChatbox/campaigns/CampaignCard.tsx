// 'use client';

// import { Campaign } from '@/types/ai-campaign';
// import { Icon } from '@/components/ui/Icon';
// import Image from 'next/image';
// import { Eye, CalendarCheck } from 'lucide-react';


// interface CampaignCardProps {
//     campaign: Campaign;
//     onView: (id: number) => void;
// }

// const formatDate = (dateStr: string | null) => {
//     if (!dateStr) return 'Ongoing';
//     const date = new Date(dateStr);
//     return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
// };

// export function CampaignCard({ campaign, onView }: CampaignCardProps) {
//     return (
//         <div className="w-96 p-4 bg-gray-50 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 inline-flex flex-col justify-start items-start gap-14">
//             <div className="self-stretch flex flex-col justify-start items-start gap-6">
//                 <div className="w-80 h-44 p-3 rounded-lg inline-flex justify-end items-start gap-2.5 overflow-hidden relative bg-gray-100">
//                     {campaign.image ? (
//                         <Image
//                             src={campaign.image}
//                             alt={campaign.title}
//                             unoptimized
//                             fill
//                             className="w-full h-full object-cover rounded-lg"
//                         />
//                     ) : (
//                         <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
//                             No image
//                         </div>
//                     )}
//                     <div className="absolute top-3 right-3">
//                         <button
//                             className="p-1.5 bg-white rounded-sm outline outline-1 outline-offset-[-1px] outline-zinc-200 flex justify-center items-center gap-1 hover:bg-gray-50 transition-colors"
//                             onClick={() => onView(campaign.id)}
//                         >
//                             <Eye width={16} height={16} />
//                         </button>
//                     </div>
//                 </div>
//                 <div className="self-stretch flex flex-col justify-start items-start gap-3">
//                     <div className="justify-start text-neutral-600 text-xl font-medium font-['Inter'] leading-5 line-clamp-1">
//                         {campaign.title}
//                     </div>
//                     <div className="self-stretch justify-start text-zinc-400 text-base font-normal font-['Inter'] leading-6 line-clamp-2">
//                         {campaign.description}
//                     </div>
//                 </div>
//                 <div className="self-stretch inline-flex justify-between items-center">
//                     <div className="px-2 py-1.5 bg-white rounded-sm outline outline-1 outline-offset-[-1px] outline-zinc-200 flex justify-center items-center gap-1">
//                         <CalendarCheck width={16} height={16} />
//                         <div className="justify-start text-neutral-600 text-sm font-normal font-['Inter'] leading-4">
//                             {formatDate(campaign.start_date)} {campaign.start_date && campaign.end_date && 'to'} {formatDate(campaign.end_date)}
//                         </div>
//                     </div>
//                     <div className={`px-3 py-1.5 bg-white rounded-sm outline outline-1 outline-offset-[-1px] outline-zinc-200 flex justify-center items-center gap-1`}>
//                         <div className={`text-sm font-normal font-['Inter'] leading-5 ${campaign.is_active ? 'text-green-800' : 'text-red-500'
//                             }`}>
//                             {campaign.is_active ? 'Active' : 'Inactive'}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }


'use client';

import { Campaign } from '@/types/ai-campaign';
import { Icon } from '@/components/ui/Icon';
import Image from 'next/image';
import { Eye, CalendarCheck } from 'lucide-react'

interface CampaignCardProps {
    campaign: Campaign;
    onView: (id: number) => void;
    onDelete: (id: number) => void;
    isDeleting: boolean;
}

const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Ongoing';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export function CampaignCard({ campaign, onView, onDelete, isDeleting }: CampaignCardProps) {
    return (
        <div className="w-full p-4 bg-gray-50 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 flex flex-col justify-start items-start gap-4">
            <div className="self-stretch flex flex-col justify-start items-start gap-4">
                <div className="w-full h-44 p-3 rounded-lg relative overflow-hidden bg-gray-100">
                    {campaign.image ? (
                        <Image
                            src={campaign.image}
                            alt={campaign.title}
                            unoptimized
                            fill
                            className="w-full h-full object-cover rounded-lg"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                            No image
                        </div>
                    )}
                    <div className="absolute top-3 right-3">
                        <button
                            className="p-1.5 bg-white rounded-sm outline outline-1 outline-offset-[-1px] outline-zinc-200 flex justify-center items-center gap-1 hover:bg-gray-50 transition-colors"
                            onClick={() => onView(campaign.id)}
                            disabled={isDeleting}
                        >
                            <Eye width={16} height={16} />
                        </button>
                    </div>
                </div>

                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-neutral-600 text-xl font-medium font-['Inter'] leading-5 line-clamp-1">
                        {campaign.title}
                    </div>
                    <div className="self-stretch justify-start text-zinc-400 text-base font-normal font-['Inter'] leading-6 line-clamp-2">
                        {campaign.description}
                    </div>
                </div>

                <div className="self-stretch inline-flex justify-between items-center">
                    <div className="px-2 py-1.5 bg-white rounded-sm outline outline-1 outline-offset-[-1px] outline-zinc-200 flex justify-center items-center gap-1">
                        <CalendarCheck width={16} height={16} />
                        <div className="justify-start text-neutral-600 text-sm font-normal font-['Inter'] leading-4">
                            {formatDate(campaign.start_date)} {campaign.start_date && campaign.end_date && 'to'} {formatDate(campaign.end_date)}
                        </div>
                    </div>
                    <div className="px-3 py-1.5 bg-white rounded-sm outline outline-1 outline-offset-[-1px] outline-zinc-200 flex justify-center items-center gap-1">
                        <div className={`text-sm font-normal font-['Inter'] leading-5 ${campaign.is_active ? 'text-green-800' : 'text-red-500'
                            }`}>
                            {campaign.is_active ? 'Active' : 'Inactive'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}