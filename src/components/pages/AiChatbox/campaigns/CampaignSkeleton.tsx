'use client';

export function CampaignSkeleton() {
    return (
        <div className="flex flex-col items-start gap-8 w-full">
            <div className="flex justify-between items-center w-full">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 w-36 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-80 bg-gray-100 rounded-lg animate-pulse" />
                ))}
            </div>
        </div>
    );
}