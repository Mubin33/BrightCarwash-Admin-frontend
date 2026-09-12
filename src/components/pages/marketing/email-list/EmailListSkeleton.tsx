export function EmailListSkeleton() {
    return (
        <div className="flex flex-col gap-6 w-full">
            <div className="flex justify-between items-end">
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="flex items-center gap-3">
                    <div className="h-12 w-65 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse" />
                </div>
            </div>
            <div className="h-100 bg-gray-100 rounded-lg animate-pulse" />
        </div>
    );
}