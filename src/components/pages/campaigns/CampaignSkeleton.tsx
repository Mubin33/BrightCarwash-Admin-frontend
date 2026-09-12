export default function CampaignsSkeleton() {
    return (
        <div className="flex flex-col gap-6 w-full">
            <div className="flex justify-between items-end">
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-9 w-36 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex justify-between items-center">
                <div className="h-9 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="flex gap-2">
                    <div className="h-9 w-48 bg-gray-200 rounded animate-pulse" />
                    <div className="h-9 w-36 bg-gray-200 rounded animate-pulse" />
                </div>
            </div>
            <div className="h-100 bg-gray-100 rounded-lg animate-pulse" />
        </div>
    );
}