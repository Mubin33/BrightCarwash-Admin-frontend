'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, getMonth, getYear, setMonth, setYear, isSameDay, isSameMonth, startOfWeek, endOfWeek, addMonths, subMonths, isWithinInterval } from 'date-fns';

interface DatePickerProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export function DatePicker({ value, onChange, placeholder = 'Select date', disabled = false, className = '' }: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Parse initial value
    useEffect(() => {
        if (value) {
            const parsed = new Date(value);
            if (!isNaN(parsed.getTime())) {
                setSelectedDate(parsed);
                setViewDate(parsed);
            }
        }
    }, [value]);

    const handleDaySelect = (date: Date) => {
        setSelectedDate(date);
        const formatted = format(date, 'yyyy-MM-dd');
        onChange(formatted);
        setIsOpen(false);
    };

    const handlePrevMonth = () => {
        setViewDate((prev) => subMonths(prev, 1));
    };

    const handleNextMonth = () => {
        setViewDate((prev) => addMonths(prev, 1));
    };

    const handleMonthChange = (month: number) => {
        setViewDate((prev) => setMonth(prev, month));
    };

    const handleYearChange = (year: number) => {
        setViewDate((prev) => setYear(prev, year));
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Generate calendar days
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days: Date[] = [];
    let day = startDate;
    while (day <= endDate) {
        days.push(day);
        day = new Date(day.setDate(day.getDate() + 1));
    }

    const displayValue = selectedDate ? format(selectedDate, 'MMM d, yyyy') : placeholder;

    // Month options
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    // Year options (current year ± 10 years)
    const currentYear = getYear(new Date());
    const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

    return (
        <div ref={dropdownRef} className={`relative w-full ${className}`}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full p-4 bg-gray-50 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 text-neutral-600 text-base font-normal font-['Inter'] leading-6 flex items-center justify-between transition-all ${isOpen ? 'outline-2 outline-sky-500' : ''
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
            >
                <span className={!selectedDate ? 'text-gray-400 truncate' : 'truncate'}>{displayValue}</span>
                <CalendarIcon size={20} className="text-gray-400 flex-shrink-0 ml-2" />
            </button>

            {/* Dropdown Calendar - positioned within viewport */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 w-full min-w-[240px] max-w-full bg-white rounded-xl shadow-lg border border-gray-200 z-50 p-3 max-h-[400px] overflow-y-auto">
                    {/* Month/Year Header */}
                    <div className="flex items-center justify-between mb-3 gap-1">
                        <button
                            type="button"
                            onClick={handlePrevMonth}
                            className="p-1 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0"
                        >
                            <ChevronLeft size={18} className="text-gray-600" />
                        </button>

                        <div className="flex items-center gap-1 min-w-0">
                            <select
                                value={getMonth(viewDate)}
                                onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                                className="text-sm font-medium text-gray-700 bg-transparent border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sky-500 max-w-[70px] truncate"
                            >
                                {months.map((month, index) => (
                                    <option key={month} value={index}>{month}</option>
                                ))}
                            </select>
                            <select
                                value={getYear(viewDate)}
                                onChange={(e) => handleYearChange(parseInt(e.target.value))}
                                className="text-sm font-medium text-gray-700 bg-transparent border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sky-500 max-w-[70px] truncate"
                            >
                                {years.map((year) => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="button"
                            onClick={handleNextMonth}
                            className="p-1 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0"
                        >
                            <ChevronRight size={18} className="text-gray-600" />
                        </button>
                    </div>

                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 gap-0.5 mb-1">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                            <div key={day} className="text-center text-[10px] font-medium text-gray-400 py-1">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-0.5">
                        {days.map((date, index) => {
                            const isCurrentMonth = isSameMonth(date, viewDate);
                            const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
                            const isToday = isSameDay(date, new Date());
                            const isInMonth = isWithinInterval(date, { start: monthStart, end: monthEnd });

                            return (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => handleDaySelect(date)}
                                    disabled={!isInMonth}
                                    className={`
                    text-center py-1.5 rounded-lg text-xs transition-all w-full
                    ${!isInMonth ? 'text-gray-300 cursor-not-allowed' : ''}
                    ${isSelected ? 'bg-sky-500 text-white hover:bg-sky-600' : ''}
                    ${!isSelected && isToday ? 'outline outline-1 outline-sky-500 text-sky-600' : ''}
                    ${!isSelected && !isToday && isInMonth ? 'hover:bg-gray-100 text-gray-700' : ''}
                    ${!isSelected && isInMonth && isCurrentMonth ? 'text-gray-700' : ''}
                    ${!isSelected && isInMonth && !isCurrentMonth ? 'text-gray-400' : ''}
                  `}
                                >
                                    {format(date, 'd')}
                                </button>
                            );
                        })}
                    </div>

                    {/* Today button */}
                    <div className="mt-2 pt-2 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => {
                                const today = new Date();
                                setViewDate(today);
                                handleDaySelect(today);
                            }}
                            className="w-full text-xs text-sky-600 hover:text-sky-700 font-medium py-1 hover:bg-gray-50 rounded-md transition-colors"
                        >
                            Today
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}