"use client";

interface HeroTextAlignmentProps {
    textAlignment: 'left' | 'center' | 'right';
    onAlignmentChange: (alignment: 'left' | 'center' | 'right') => void;
}

export function HeroTextAlignment({
    textAlignment,
    onAlignmentChange,
}: HeroTextAlignmentProps) {
    return (
        <div className='flex flex-col gap-2'>
            <label className='text-[#777980] font-inter text-base font-normal leading-5'>
                Text Alignment
            </label>
            <div className='flex gap-2'>
                <button
                    onClick={() => onAlignmentChange('left')}
                    className={`flex-1 p-4 rounded-lg border flex flex-col items-center gap-2 transition-all ${textAlignment === 'left'
                        ? 'bg-[#EBF5FF] border-[#0098E8]'
                        : 'bg-white border-[#DFE1E7] hover:border-[#0098E8]'
                        }`}
                >
                    <div className='w-6 h-6 flex flex-col gap-1'>
                        <div className='w-4 h-0.5 bg-[#0098E8]' />
                        <div className='w-2 h-0.5 bg-[#0098E8]' />
                        <div className='w-4 h-0.5 bg-[#0098E8]' />
                        <div className='w-2 h-0.5 bg-[#0098E8]' />
                    </div>
                    <span
                        className={`text-sm font-medium ${textAlignment === 'left'
                            ? 'text-[#0098E8]'
                            : 'text-[#777980]'
                            }`}
                    >
                        Left Align
                    </span>
                </button>

                <button
                    onClick={() => onAlignmentChange('center')}
                    className={`flex-1 p-4 rounded-lg border flex flex-col items-center gap-2 transition-all ${textAlignment === 'center'
                        ? 'bg-[#EBF5FF] border-[#0098E8]'
                        : 'bg-white border-[#DFE1E7] hover:border-[#0098E8]'
                        }`}
                >
                    <div className='w-6 h-6 flex flex-col items-center gap-1'>
                        <div className='w-4 h-0.5 bg-[#777980]' />
                        <div className='w-2 h-0.5 bg-[#777980]' />
                        <div className='w-4 h-0.5 bg-[#777980]' />
                        <div className='w-2 h-0.5 bg-[#777980]' />
                    </div>
                    <span className='text-sm font-medium text-[#777980]'>
                        Center Align
                    </span>
                </button>

                <button
                    onClick={() => onAlignmentChange('right')}
                    className={`flex-1 p-4 rounded-lg border flex flex-col items-center gap-2 transition-all ${textAlignment === 'right'
                        ? 'bg-[#EBF5FF] border-[#0098E8]'
                        : 'bg-white border-[#DFE1E7] hover:border-[#0098E8]'
                        }`}
                >
                    <div className='w-6 h-6 flex flex-col items-end gap-1'>
                        <div className='w-4 h-0.5 bg-[#777980]' />
                        <div className='w-2 h-0.5 bg-[#777980]' />
                        <div className='w-4 h-0.5 bg-[#777980]' />
                        <div className='w-2 h-0.5 bg-[#777980]' />
                    </div>
                    <span className='text-sm font-medium text-[#777980]'>
                        Right Align
                    </span>
                </button>
            </div>
        </div>
    );
}