'use client';

export function KnowledgeSkeleton() {
    return (
        <div className="flex flex-col items-start gap-8">
            <div className="flex justify-between items-center w-full">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 w-36 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="w-full h-64 bg-gray-100 rounded-lg animate-pulse" />
        </div>
    );
}