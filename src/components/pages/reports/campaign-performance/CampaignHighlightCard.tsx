import type { CampaignHighlight } from '@/types/reports';

interface Props {
    highlight: CampaignHighlight;
    index: number;
}

const iconColors = ['#FFD700', '#C0C0C0', '#CD7F32', '#9B59B6'];

export function CampaignHighlightCard({ highlight, index }: Props) {
    const iconColor = iconColors[index] || '#9B59B6';

    return (
        <div className="flex p-4 flex-col items-center gap-8 rounded-xl border border-[#DFE1E7] bg-[#F8FAFB] flex-1">
            <div className="flex flex-col items-center gap-5">
                <span className="text-[#1B1B1B] font-inter text-base font-semibold text-center">
                    {highlight.name}
                </span>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <path
                        opacity="0.4"
                        d="M15.2123 2.08301H15.3122H24.7901C26.2121 2.08293 27.4281 2.08286 28.3989 2.24066C29.4564 2.41251 30.3886 2.79454 31.1101 3.66913C31.8066 4.51329 32.0456 5.46051 32.0799 6.51095C32.1118 7.48021 31.9698 8.65778 31.8029 10.0412C31.1524 15.4401 29.7271 20.2918 27.7738 23.7415C25.8556 27.1288 23.2104 29.583 20.0013 29.583C16.7919 29.583 14.1468 27.1288 12.2287 23.7415C10.2753 20.2918 8.84992 15.4401 8.19942 10.0412C8.03265 8.65778 7.8907 7.48021 7.92244 6.51095C7.95684 5.46051 8.19584 4.51329 8.89229 3.66913C9.61384 2.79454 10.5459 2.41251 11.6034 2.24066C12.5744 2.08286 13.7904 2.08293 15.2123 2.08301Z"
                        fill={iconColor}
                    />
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M7.91883 6.667H7.06101C6.14953 6.66687 5.29948 6.66674 4.61776 6.76149C3.87393 6.86489 3.00371 7.11955 2.35745 7.89809C1.70086 8.68905 1.62502 9.5974 1.6843 10.3516C1.73741 11.0273 1.92435 11.8395 2.1208 12.693L2.79596 15.629C3.92923 20.557 8.03758 24.1825 12.9816 24.9657C12.7195 24.5743 12.4684 24.1657 12.2287 23.7422C11.7286 22.8592 11.2632 21.8842 10.8365 20.8317C8.44441 19.6598 6.64793 17.506 6.04451 14.8819L5.3933 12.0501C5.16413 11.0535 5.03868 10.4885 5.00738 10.0903C5.43127 10.0314 6.11305 10.0003 7.1641 10.0003H8.19441C8.03861 8.70774 7.90591 7.59595 7.91883 6.667ZM27.0208 24.9657C31.9648 24.1823 36.0731 20.557 37.2063 15.629L37.8574 12.7971C38.0539 11.9436 38.2648 11.0273 38.3179 10.3516C38.3773 9.5974 38.3014 8.68905 37.6448 7.89809C36.9986 7.11955 36.1283 6.86489 35.3844 6.76149C34.7028 6.66674 33.8528 6.66687 32.9413 6.667H32.0836C32.0964 7.59595 31.9638 8.70774 31.8079 10.0003H32.8381C33.8891 10.0003 34.5709 10.0314 34.9948 10.0903C34.9636 10.4885 34.8381 11.0535 34.6089 12.0501L33.9578 14.8819C33.3543 17.5058 31.5579 19.6597 29.1659 20.8317C28.7393 21.8842 28.2738 22.8592 27.7738 23.7422C27.5339 24.1657 27.2829 24.5743 27.0208 24.9657Z"
                        fill={iconColor}
                    />
                    <path
                        d="M16.1013 28.2853C14.4658 29.367 13.1725 31.0898 12.3688 33.0843C11.933 34.1657 12.0216 35.3087 12.4481 36.2037C12.8599 37.0677 13.7188 37.9162 14.93 37.9162H25.0675C26.2786 37.9162 27.1376 37.0677 27.5493 36.2037C27.9758 35.3087 28.0645 34.1657 27.6286 33.0843C26.825 31.0898 25.5316 29.367 23.896 28.2852C22.7155 29.107 21.4118 29.5828 19.9986 29.5828C18.5855 29.5828 17.2818 29.107 16.1013 28.2853Z"
                        fill={iconColor}
                    />
                </svg>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex flex-col justify-center items-center gap-2">
                    <span className="text-[#0098E8] font-inter text-[32px] font-medium leading-[100%] tracking-[-0.96px]">
                        {highlight.openRate}%
                    </span>
                    <span className="text-[#777980] font-inter text-base font-normal leading-[100%] tracking-[-0.24px]">
                        Open Rate
                    </span>
                </div>
                <div className="w-px h-12 bg-[#DFE1E7]" />
                <div className="flex flex-col justify-center items-center gap-2">
                    <span className="text-[#006F1F] font-inter text-[32px] font-medium leading-[100%] tracking-[-0.96px]">
                        {highlight.clickRate}%
                    </span>
                    <span className="text-[#777980] font-inter text-base font-normal leading-[100%] tracking-[-0.24px]">
                        Click Rate
                    </span>
                </div>
            </div>
        </div>
    );
}