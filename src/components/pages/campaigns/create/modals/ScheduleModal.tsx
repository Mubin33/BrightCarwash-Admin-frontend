"use client";

import { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FilterDropdown } from "@/components/ui/FilterDropdown";

interface ScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSchedule: (scheduledAt: string) => void;
    isScheduling?: boolean;
}

const labelClass = "text-[#777980] font-inter text-base font-normal leading-[130%]";

function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

export function ScheduleModal({
    isOpen,
    onClose,
    onSchedule,
    isScheduling = false,
}: ScheduleModalProps) {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);

    const [selectedMonth, setSelectedMonth] = useState(defaultDate.getMonth());
    const [selectedDay, setSelectedDay] = useState(defaultDate.getDate());
    const [selectedYear, setSelectedYear] = useState(defaultDate.getFullYear());
    const [selectedHour, setSelectedHour] = useState(9);
    const [selectedMinute, setSelectedMinute] = useState(0);
    const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">("AM");
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            const d = new Date();
            d.setDate(d.getDate() + 7);
            setSelectedMonth(d.getMonth());
            setSelectedDay(d.getDate());
            setSelectedYear(d.getFullYear());
            setSelectedHour(9);
            setSelectedMinute(0);
            setSelectedPeriod("AM");
            setError("");
        }
    }, [isOpen]);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ];

    const monthOptions = useMemo(() => months.map((m, i) => ({ value: String(i), label: m })), []);
    const dayOptions = useMemo(
        () =>
            Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => ({
                value: String(i + 1),
                label: String(i + 1),
            })),
        [selectedYear, selectedMonth]
    );
    const yearOptions = useMemo(
        () =>
            Array.from({ length: 5 }, (_, i) => {
                const y = new Date().getFullYear() + i;
                return { value: String(y), label: String(y) };
            }),
        []
    );
    const hourOptions = useMemo(
        () =>
            Array.from({ length: 12 }, (_, i) => ({
                value: String(i + 1),
                label: String(i + 1).padStart(2, "0"),
            })),
        []
    );
    const minuteOptions = useMemo(
        () => [
            { value: "0", label: "00" },
            { value: "15", label: "15" },
            { value: "30", label: "30" },
            { value: "45", label: "45" },
        ],
        []
    );
    const periodOptions = useMemo(
        () => [
            { value: "AM", label: "AM" },
            { value: "PM", label: "PM" },
        ],
        []
    );

    const handleSchedule = () => {
        const hour24 =
            selectedPeriod === "PM" && selectedHour !== 12
                ? selectedHour + 12
                : selectedPeriod === "AM" && selectedHour === 12
                    ? 0
                    : selectedHour;

        const scheduled = new Date(selectedYear, selectedMonth, selectedDay, hour24, selectedMinute);

        if (scheduled <= new Date()) {
            setError("Please select a future date and time");
            return;
        }

        onSchedule(scheduled.toISOString());
    };

    const modalTitle = (
        <div className="flex flex-col gap-1">
            <span className="text-[#1D1F2C] font-inter text-2xl font-medium leading-[100%]">
                Schedule Campaign
            </span>
            <span className="text-[#777980] font-inter text-sm font-normal leading-[132%]">
                Choose when this campaign should be sent automatically.
            </span>
        </div>
    );

    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={modalTitle}
            size="md"
            bodyClassName="py-3"
        >
            <div className="flex flex-col gap-4">
                <div className="w-full h-px bg-[#DFE1E7]" />

                {/* Date Section */}
                <div>
                    <label className={labelClass}>Date</label>
                    <div className="flex gap-2 mt-1.5">
                        <FilterDropdown
                            label="Month"
                            options={monthOptions}
                            value={String(selectedMonth)}
                            onChange={(val) => {
                                const newMonth = Number(val);
                                setSelectedMonth(newMonth);
                                const maxDay = getDaysInMonth(selectedYear, newMonth);
                                if (selectedDay > maxDay) setSelectedDay(maxDay);
                            }}
                            fullWidth
                            scrollable
                        />
                        <FilterDropdown
                            label="Day"
                            options={dayOptions}
                            value={String(selectedDay)}
                            onChange={(val) => setSelectedDay(Number(val))}
                            fullWidth
                            scrollable
                        />
                        <FilterDropdown
                            label="Year"
                            options={yearOptions}
                            value={String(selectedYear)}
                            onChange={(val) => setSelectedYear(Number(val))}
                            fullWidth
                            scrollable
                        />
                    </div>
                </div>

                {/* Time Section */}
                <div>
                    <label className={labelClass}>Time</label>
                    <div className="flex gap-2 mt-1.5">
                        <FilterDropdown
                            label="Hour"
                            options={hourOptions}
                            value={String(selectedHour)}
                            onChange={(val) => setSelectedHour(Number(val))}
                            fullWidth
                            scrollable
                        />
                        <FilterDropdown
                            label="Min"
                            options={minuteOptions}
                            value={String(selectedMinute)}
                            onChange={(val) => setSelectedMinute(Number(val))}
                            fullWidth
                            scrollable
                        />
                        <FilterDropdown
                            label="AM/PM"
                            options={periodOptions}
                            value={selectedPeriod}
                            onChange={(val) => setSelectedPeriod(val as "AM" | "PM")}
                            fullWidth
                        />
                    </div>
                </div>

                {error && (
                    <p className="text-[#FF4345] font-inter text-xs">{error}</p>
                )}

                <p className="text-[#777980] font-inter text-xs">
                    Your timezone: <span className="text-[#1B1B1B] font-medium">{userTimezone}</span>. Campaign will be sent automatically at the specified date and time.
                </p>

                <div className="flex gap-3 justify-end pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 py-2.5"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSchedule}
                        isLoading={isScheduling}
                        loadingText="Scheduling..."
                        className="flex-1 py-2.5"
                    >
                        Schedule
                    </Button>
                </div>
            </div>
        </Modal>
    );
}