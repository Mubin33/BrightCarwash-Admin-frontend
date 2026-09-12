"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { EditBusinessHoursTimeRow } from "./EditBusinessHoursTimeRow";

export interface BusinessHoursForm {
  sunday: {
    start_time: string;
    end_time: string;
  };
  mondayThursday: {
    start_time: string;
    end_time: string;
  };
  fridaySaturday: {
    start_time: string;
    end_time: string;
  };
}

interface EditBusinessHoursModalProps {
  isOpen: boolean;
  hours: BusinessHoursForm;
  isUpdating: boolean;
  onClose: () => void;
  onSave: () => void;
  onChange: (
    day: keyof BusinessHoursForm,
    field: "start_time" | "end_time",
    value: string,
  ) => void;
}

export default function EditBusinessHoursModal({
  isOpen,
  hours,
  isUpdating,
  onClose,
  onSave,
  onChange,
}: EditBusinessHoursModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Allow the initial render before starting the animation
      requestAnimationFrame(() => {
        setVisible(true);
      });
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  // Keep modal mounted while closing animation finishes
  if (!isOpen && !visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 transition-opacity duration-300 ease-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isUpdating) {
          onClose();
        }
      }}
    >
      <div
        className={`w-full max-w-lg transform rounded-xl bg-white shadow-xl transition-all duration-300 ease-out ${
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-95 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DFE1E7] px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-[#1D2939]">
              Edit Business Hours
            </h3>

            <p className="mt-1 text-sm text-[#667085]">
              Update your business operating hours.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isUpdating}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-xl text-[#667085] transition hover:bg-gray-100 hover:text-[#1D2939] disabled:cursor-not-allowed disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-5 p-6">
          <EditBusinessHoursTimeRow
            label="Sunday"
            startTime={hours.sunday.start_time}
            endTime={hours.sunday.end_time}
            onStartChange={(value) => onChange("sunday", "start_time", value)}
            onEndChange={(value) => onChange("sunday", "end_time", value)}
          />

          <EditBusinessHoursTimeRow
            label="Monday - Thursday"
            startTime={hours.mondayThursday.start_time}
            endTime={hours.mondayThursday.end_time}
            onStartChange={(value) =>
              onChange("mondayThursday", "start_time", value)
            }
            onEndChange={(value) =>
              onChange("mondayThursday", "end_time", value)
            }
          />

          <EditBusinessHoursTimeRow
            label="Friday - Saturday"
            startTime={hours.fridaySaturday.start_time}
            endTime={hours.fridaySaturday.end_time}
            onStartChange={(value) =>
              onChange("fridaySaturday", "start_time", value)
            }
            onEndChange={(value) =>
              onChange("fridaySaturday", "end_time", value)
            }
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-[#DFE1E7] px-6 py-4">
          <Button
            type="button"
            onClick={onClose}
            disabled={isUpdating}
            className="w-auto! cursor-pointer rounded-md border border-[#D0D5DD] bg-white px-5 py-2 text-sm font-medium !text-[#344054] hover:bg-gray-50"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={onSave}
            disabled={isUpdating}
            className="w-auto! cursor-pointer rounded-md bg-[#0098E8] px-5 py-2 text-sm font-medium text-white hover:bg-[#0088D8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUpdating ? "Updating..." : "Update Hours"}
          </Button>
        </div>
      </div>
    </div>
  );
}
