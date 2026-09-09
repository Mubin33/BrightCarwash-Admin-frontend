"use client";

import { useMemo } from "react";
import type { ActivityItem, ActivityType } from "@/types/lead-detail";

interface Props {
    activities: ActivityItem[];
}

const dotColors: Record<ActivityType, string> = {
    stage: "bg-[#B23730]",
    staff: "bg-[#B23730]",
    lead: "bg-[#0098E8]",
    coupon: "bg-[#0098E8]",
};

function TimelineDot({ type }: { type: ActivityType }) {
    return <div className={`w-3 h-3 rounded-full shrink-0 mt-1 ${dotColors[type]}`} />;
}

export function AssignmentHistory({ activities }: Props) {
    // Filter staff activities, exclude "Unknown" subtitles, and sort
    const assignmentActivities = useMemo(() => {
        return activities
            .filter((activity) => activity.type === "staff")
            .filter((activity) => activity.subtitle !== "Unknown")
            .sort((a, b) => {
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            });
    }, [activities]);

    return (
        <div className="flex p-5 flex-col items-start gap-4 self-stretch rounded-lg border border-[#DFE1E7] bg-white">
            <h3 className="text-[#1A1C21] font-inter text-lg font-semibold">Assignment History</h3>
            <div className="w-full h-px bg-[#DFE1E7]" />

            <div className="relative pl-1 max-h-64 overflow-y-auto adm-timeline-scroll self-stretch">
                {assignmentActivities.length === 0 && (
                    <p className="text-sm text-[#777980] text-center py-4">No assignment history yet</p>
                )}
                {assignmentActivities.map((item, i) => (
                    <div key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
                        {i !== assignmentActivities.length - 1 && (
                            <div
                                className="absolute left-[5px] top-4 bottom-0 w-px bg-[#DFE1E7]"
                                style={{ height: "calc(100% + 8px)" }}
                            />
                        )}
                        <TimelineDot type={item.type} />
                        <div className="flex flex-col -mt-0.5">
                            <span className="text-[15px] font-medium text-[#1B1B1B]">
                                {item.title}
                                {item.subtitle && <span className="font-semibold">{item.subtitle}</span>}
                            </span>
                            {item.description && (
                                <span className="text-sm text-[#777980]">{item.description}</span>
                            )}
                            {(item.user || item.date) && (
                                <span className="text-[13px] text-[#777980] mt-0.5">
                                    {item.user && (
                                        <>
                                            by <span className="text-[#4A4C56]">{item.user}</span>
                                            {item.date && " • "}
                                        </>
                                    )}
                                    {item.date}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}