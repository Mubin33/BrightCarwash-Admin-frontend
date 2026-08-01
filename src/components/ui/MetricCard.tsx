import { Icon } from "@/components/ui/Icon";
import type { MetricCard as MetricCardType } from "@/types/dashboard";

interface MetricCardProps {
  data: MetricCardType;
}

export function MetricCard({ data }: MetricCardProps) {
  const isPositive = data.changeDirection === "up";
  const isNone = data.changeDirection === "none";

  const isPercentage = /^[+-]?\d*\.?\d+\s*%?$/.test(data.changePercent.trim());

  return (
    <div className="flex p-2.5 sm:p-3 flex-col items-start gap-2 sm:gap-3 w-full rounded-lg border border-[#DFE1E7] bg-white">
      <span className="text-[#777980] font-geist text-xs sm:text-sm font-normal leading-[150%] tracking-[-0.21px]">
        {data.heading}
      </span>

      <span className="text-[#0B1220] font-lora text-lg sm:text-xl lg:text-2xl font-medium leading-[130%] tracking-[-0.72px]">
        {data.value}
      </span>

      <div className="h-px w-full bg-[#E8E8E9]" />

      <div className="flex justify-between items-center w-full gap-2">
        <div className="flex items-center gap-1">
          {!isNone && <Icon
            name={isPositive ? "rise" : "fall"}
            width={14}
            height={14}
            className="sm:w-4 sm:h-4"
          />}
          <span className={`text-xs sm:text-sm font-medium ${isNone
              ? "text-[#777980]"
              : isPositive && isPercentage
                ? "text-[#006F1F]"
                : isPositive && !isPercentage
                  ? "text-[#777980]"
                  : "text-[#FF4345]"
            }`}>
            {isPositive}
            {data.changePercent}
          </span>
        </div>
        <span className="text-[#777980] font-inter text-xs sm:text-sm font-normal leading-[150%] tracking-[-0.21px] truncate">
          {data.vsLabel}
        </span>
      </div>
    </div>
  );
}