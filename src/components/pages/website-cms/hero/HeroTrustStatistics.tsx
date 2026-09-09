"use client";

import { Icon } from '@/components/ui/Icon';

interface HeroTrustStatisticsProps {
    starRating: string;
    setStarRating: (value: string) => void;
    carsWashed: string;
    setCarsWashed: (value: string) => void;
    avgTime: string;
    setAvgTime: (value: string) => void;
}

export function HeroTrustStatistics({
    starRating,
    setStarRating,
    carsWashed,
    setCarsWashed,
    avgTime,
    setAvgTime,
}: HeroTrustStatisticsProps) {
    return (
        <div className="p-6 bg-[#F8FAFB] rounded-lg border border-[#DFE1E7] flex flex-col gap-4">
            <span className="text-[#1B1B1B] text-xl font-medium leading-6">Trust Statistics</span>

            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-[#777980] font-inter text-base font-normal leading-5">Star Rating</label>
                    <input
                        type="text"
                        value={starRating}
                        onChange={(e) => setStarRating(e.target.value)}
                        placeholder="4.9"
                        className="w-full px-4 py-3 bg-white rounded-lg border border-[#DFE1E7] text-[#1B1B1B] placeholder-[#777980] font-inter text-base outline-none focus:border-[#0098E8] transition-all"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[#777980] font-inter text-base font-normal leading-5">Cars Washed</label>
                    <input
                        type="text"
                        value={carsWashed}
                        onChange={(e) => setCarsWashed(e.target.value)}
                        placeholder="12K+"
                        className="w-full px-4 py-3 bg-white rounded-lg border border-[#DFE1E7] text-[#1B1B1B] placeholder-[#777980] font-inter text-base outline-none focus:border-[#0098E8] transition-all"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[#777980] font-inter text-base font-normal leading-5">Avg Time</label>
                    <input
                        type="text"
                        value={avgTime}
                        onChange={(e) => setAvgTime(e.target.value)}
                        placeholder="15-Min Average"
                        className="w-full px-4 py-3 bg-white rounded-lg border border-[#DFE1E7] text-[#1B1B1B] placeholder-[#777980] font-inter text-base outline-none focus:border-[#0098E8] transition-all"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[#777980] font-inter text-base font-normal leading-5">Preview</label>
                    <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-[#DFE1E7]">
                        <div className="flex items-center gap-2">
                            <Icon name="star" width={20} height={20} color="#FFAF00" />
                            <span className="text-[#1B1B1B] font-inter text-base leading-4">{starRating} Rating</span>
                        </div>
                        <div className="w-px h-6 bg-[#DFE1E7]" />
                        <div className="flex items-center gap-2">
                            <Icon name="broom" width={20} height={20} color="#1B1B1B" />
                            <span className="text-[#1B1B1B] font-inter text-base leading-4">{carsWashed} Cars Washed</span>
                        </div>
                        <div className="w-px h-6 bg-[#DFE1E7]" />
                        <div className="flex items-center gap-2">
                            <Icon name="clock" width={20} height={20} color="#1B1B1B" />
                            <span className="text-[#1B1B1B] font-inter text-base leading-4">{avgTime}</span>
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-center text-[#0098E8] text-sm font-normal leading-5">
                Shown below the CTA buttons. Update as your business grows.
            </p>
        </div>
    );
}