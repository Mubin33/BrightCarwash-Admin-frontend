"use client";

interface HeroStatusSelectorProps {
    status: 'form' | 'banner' | 'hidden';
    onChange: (status: 'form' | 'banner' | 'hidden') => void;
}

export function HeroStatusSelector({ status, onChange }: HeroStatusSelectorProps) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-[#777980] font-inter text-base font-normal leading-5">Status</label>
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => onChange('form')}
                    className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${status === 'form'
                            ? 'bg-[#F7EBEA] border-[#B23730]'
                            : 'bg-white border-[#DFE1E7] hover:border-[#B23730]'
                        }`}
                >
                    <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${status === 'form'
                                ? 'border-[#B23730]'
                                : 'border-[#E8E8E9]'
                            }`}
                    >
                        {status === 'form' && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#B23730]" />
                        )}
                    </div>
                    <span className="text-[#1B1B1B] font-inter text-lg font-normal leading-6">Form</span>
                </button>

                <button
                    type="button"
                    onClick={() => onChange('banner')}
                    className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${status === 'banner'
                            ? 'bg-[#F7EBEA] border-[#B23730]'
                            : 'bg-white border-[#DFE1E7] hover:border-[#B23730]'
                        }`}
                >
                    <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${status === 'banner'
                                ? 'border-[#B23730]'
                                : 'border-[#E8E8E9]'
                            }`}
                    >
                        {status === 'banner' && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#B23730]" />
                        )}
                    </div>
                    <span className="text-[#1B1B1B] font-inter text-lg font-normal leading-6">Banner</span>
                </button>

                <button
                    type="button"
                    onClick={() => onChange('hidden')}
                    className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${status === 'hidden'
                            ? 'bg-[#F7EBEA] border-[#B23730]'
                            : 'bg-white border-[#DFE1E7] hover:border-[#B23730]'
                        }`}
                >
                    <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${status === 'hidden'
                                ? 'border-[#B23730]'
                                : 'border-[#E8E8E9]'
                            }`}
                    >
                        {status === 'hidden' && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#B23730]" />
                        )}
                    </div>
                    <span className="text-[#1B1B1B] font-inter text-lg font-normal leading-6">Hidden</span>
                </button>
            </div>
        </div>
    );
}