"use client";

interface HeroTextContentProps {
    eyebrowText: string;
    setEyebrowText: (value: string) => void;
    mainHeadline: string;
    setMainHeadline: (value: string) => void;
    subtext: string;
    setSubtext: (value: string) => void;
}

export function HeroTextContent({
    eyebrowText,
    setEyebrowText,
    mainHeadline,
    setMainHeadline,
    subtext,
    setSubtext,
}: HeroTextContentProps) {
    return (
        <div className="p-6 bg-[#F8FAFB] rounded-lg border border-[#DFE1E7] flex flex-col gap-4">
            <span className="text-[#1B1B1B] text-xl font-medium leading-6">Text Content</span>

            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-[#777980] font-inter text-base font-normal leading-5">Eyebrow Text</label>
                    <input
                        type="text"
                        value={eyebrowText}
                        onChange={(e) => setEyebrowText(e.target.value)}
                        placeholder="Veteran-Owner Naperville, IL EST.2025"
                        className="w-full px-4 py-3 bg-white rounded-lg border border-[#DFE1E7] text-[#1B1B1B] placeholder-[#777980] font-inter text-base outline-none focus:border-[#0098E8] transition-all"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[#777980] font-inter text-base font-normal leading-5">Main Headline</label>
                    <textarea
                        value={mainHeadline}
                        onChange={(e) => setMainHeadline(e.target.value)}
                        placeholder="YOUR CAR DESERVES A BRIGHTER STANDARD."
                        rows={3}
                        className="w-full px-4 py-3 bg-white rounded-lg border border-[#DFE1E7] text-[#1B1B1B] placeholder-[#777980] font-inter text-base outline-none focus:border-[#0098E8] transition-all resize-none"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[#777980] font-inter text-base font-normal leading-5">Subtext</label>
                    <textarea
                        value={subtext}
                        onChange={(e) => setSubtext(e.target.value)}
                        placeholder="Book online in 60 seconds. Pay a small deposit to lock in your spot — and we'll handle the rest."
                        rows={2}
                        className="w-full px-4 py-3 bg-white rounded-lg border border-[#DFE1E7] text-[#1B1B1B] placeholder-[#777980] font-inter text-base outline-none focus:border-[#0098E8] transition-all resize-none"
                    />
                </div>
            </div>
        </div>
    );
}