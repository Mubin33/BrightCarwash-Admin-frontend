'use client';

interface CampaignViewStatusProps {
    isActive: boolean;
    isEditing: boolean;
    isUpdating: boolean;
    onStatusChange: (value: boolean) => void;
}

export function CampaignViewStatus({
    isActive,
    isEditing,
    isUpdating,
    onStatusChange,
}: CampaignViewStatusProps) {
    return (
        <div className="flex flex-col gap-2">
            <div className="text-zinc-500 text-base font-normal font-['Inter'] leading-5">
                Status
            </div>
            {isEditing ? (
                <div className="flex gap-2">
                    <button
                        onClick={() => onStatusChange(false)}
                        className={`flex-1 px-4 py-3 rounded-lg outline outline-1 outline-offset-[-1px] flex items-center gap-2 transition-colors ${!isActive
                                ? 'outline-red-700 bg-pink-100'
                                : 'outline-gray-100 bg-white'
                            }`}
                        disabled={isUpdating}
                    >
                        <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${!isActive
                                    ? 'border-red-700'
                                    : 'border-gray-200'
                                }`}
                        >
                            {!isActive && (
                                <div className="w-2.5 h-2.5 bg-red-700 rounded-full" />
                            )}
                        </div>
                        <span className="text-neutral-800 text-lg font-normal font-['Inter'] leading-6 line-clamp-1">
                            Inactive
                        </span>
                    </button>
                    <button
                        onClick={() => onStatusChange(true)}
                        className={`flex-1 px-4 py-3 rounded-lg outline outline-1 outline-offset-[-1px] flex items-center gap-2 transition-colors ${isActive
                                ? 'outline-green-700 bg-green-50'
                                : 'outline-gray-100 bg-white'
                            }`}
                        disabled={isUpdating}
                    >
                        <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${isActive
                                    ? 'border-green-700'
                                    : 'border-gray-200'
                                }`}
                        >
                            {isActive && (
                                <div className="w-2.5 h-2.5 bg-green-700 rounded-full" />
                            )}
                        </div>
                        <span className="text-neutral-800 text-lg font-normal font-['Inter'] leading-6 line-clamp-1">
                            Active
                        </span>
                    </button>
                </div>
            ) : (
                <div className={`w-full p-4 rounded-lg outline outline-1 outline-offset-[-1px] ${isActive
                        ? 'outline-green-200 bg-green-50 text-green-800'
                        : 'outline-red-200 bg-red-50 text-red-800'
                    } text-base font-normal font-['Inter'] leading-6`}>
                    {isActive ? 'Active' : 'Inactive'}
                </div>
            )}
        </div>
    );
}