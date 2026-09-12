interface TimeRowProps {
  label: string;
  startTime: string;
  endTime: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
}

export function EditBusinessHoursTimeRow({
  label,
  startTime,
  endTime,
  onStartChange,
  onEndChange,
}: TimeRowProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#344054]">
        {label}
      </label>

      <div className="grid grid-cols-2 gap-3">
        {/* Start */}
        <div>
          <label className="mb-1 block text-xs text-[#667085]">
            Start Time
          </label>

          <input
            type="time"
            value={startTime}
            onChange={(e) => onStartChange(e.target.value)}
            className="h-11 w-full rounded-md border border-[#D0D5DD] px-3 text-sm outline-none focus:border-[#0098E8] focus:ring-1 focus:ring-[#0098E8] cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer"
          />
        </div>

        {/* End */}
        <div>
          <label className="mb-1 block text-xs text-[#667085]">End Time</label>

          <input
            type="time"
            value={endTime}
            onChange={(e) => onEndChange(e.target.value)}
            className="h-11 w-full rounded-md border border-[#D0D5DD] px-3 text-sm outline-none focus:border-[#0098E8] focus:ring-1 focus:ring-[#0098E8] cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
