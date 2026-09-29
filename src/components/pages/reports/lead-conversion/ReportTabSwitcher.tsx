"use client";

import { Button } from "@/components/ui/Button";
import { useEffect, useRef, useState } from "react";

export interface TabItem {
  value: string;
  label: string;
}

const DEFAULT_TABS: readonly TabItem[] = [
  { value: "lead-conversion", label: "Lead Conversion" },
  { value: "campaign-performance", label: "Campaign Performance" },
  { value: "member-activity", label: "Member Activity" },
] as const;

interface Props {
  tabs?: readonly TabItem[] | TabItem[];
  activeTab: string;
  onChange: (tab: string) => void;
}

export function ReportTabSwitcher({
  tabs = DEFAULT_TABS,
  activeTab,
  onChange,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [sliderStyle, setSliderStyle] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!ref.current) return;
    const timer = requestAnimationFrame(() => {
      const active = ref.current?.querySelector(
        `button[data-tab="${activeTab}"]`,
      ) as HTMLElement;
      if (active) {
        setSliderStyle({
          left: `${active.offsetLeft}px`,
          width: `${active.offsetWidth}px`,
          opacity: "1",
        });
      } else {
        setSliderStyle({ opacity: "0" });
      }
    });
    return () => cancelAnimationFrame(timer);
  }, [activeTab, tabs]);

  if (!tabs || tabs.length === 0) return null;

  return (
    <div className="w-fit">
      <div
        ref={ref}
        className="relative flex p-1 items-center gap-0.5 rounded-lg border border-[#DFE1E7] bg-[#F6F6F6]"
      >
        <div
          className="absolute top-1 h-[calc(100%-8px)] rounded-md bg-[#B23730] shadow-[0_4px_4px_0_rgba(0,0,0,0.05)] transition-all duration-300 z-0"
          style={sliderStyle}
        />
        {tabs.map((t) => (
          <Button
            key={t.value}
            variant="icon"
            data-tab={t.value}
            onClick={() => onChange(t.value)}
            className={`relative z-10 flex py-2 px-3 justify-center items-center gap-1 rounded-md text-sm font-inter transition-colors duration-200 whitespace-nowrap w-auto! ${activeTab === t.value ? "text-white" : "text-[#1B1B1B]"}`}
          >
            {t.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
