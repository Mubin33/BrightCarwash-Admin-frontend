"use client";

import { useState } from "react";
import { format, parse } from "date-fns";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { PERMISSIONS } from "@/lib/permissions";
import {
  useGetBusinessHoursQuery,
  useEditBusinessHoursMutation,
} from "@/services/businessHours.api";

import EditBusinessHoursModal, {
  type BusinessHoursForm,
} from "./EditBusinessHoursModal";

export default function BusinessHours() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [hours, setHours] = useState<BusinessHoursForm>({
    sunday: {
      start_time: "08:00",
      end_time: "18:00",
    },
    mondayThursday: {
      start_time: "08:00",
      end_time: "18:00",
    },
    fridaySaturday: {
      start_time: "08:00",
      end_time: "18:00",
    },
  });

  const {
    data: businessHours,
    isLoading,
    isFetching,
  } = useGetBusinessHoursQuery({
    section_name: "business_hours",
  });

  const [editBusinessHours, { isLoading: isUpdating }] =
    useEditBusinessHoursMutation();

  // Open modal
  const handleOpenBusinessHoursModal = () => {
    setHours({
      sunday: {
        start_time: businessHours?.content?.sunday?.start_time || "08:00",
        end_time: businessHours?.content?.sunday?.end_time || "18:00",
      },

      mondayThursday: {
        start_time: businessHours?.content?.mondayThursday?.start_time || "08:00",
        end_time: businessHours?.content?.mondayThursday?.end_time || "18:00",
      },

      fridaySaturday: {
        start_time: businessHours?.content?.fridaySaturday?.start_time || "08:00",
        end_time: businessHours?.content?.fridaySaturday?.end_time || "18:00",
      },
    });

    setIsModalOpen(true);
  };

  // Change input value
  const handleTimeChange = (
    day: keyof BusinessHoursForm,
    field: "start_time" | "end_time",
    value: string,
  ) => {
    setHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  // Update or Create API
  const handleSaveBusinessHours = async () => {
    try {
      await editBusinessHours({
        section_name: "business_hours",

        body: {
          section_key: businessHours?.section_key || "business_hours",
          section_type: businessHours?.section_type || "business_hours",

          content: {
            sunday: {
              start_time: hours.sunday.start_time,
              end_time: hours.sunday.end_time,
            },

            mondayThursday: {
              start_time: hours.mondayThursday.start_time,
              end_time: hours.mondayThursday.end_time,
            },

            fridaySaturday: {
              start_time: hours.fridaySaturday.start_time,
              end_time: hours.fridaySaturday.end_time,
            },
          },

          is_active: businessHours?.is_active ?? true,
          sort_order: businessHours?.sort_order ?? 1,
        },
      }).unwrap();

      toast.success(
        businessHours
          ? "Timing updated successfully"
          : "Timing created successfully",
      );

      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save Timing:", error);

      toast.error(
        businessHours ? "Failed to update Timing" : "Failed to create Timing",
      );
    }
  };

  // Date Time Format
  const formatTime = (start: string, end: string) => {
    const formatTimeValue = (time: string) => {
      try {
        return format(parse(time, "HH:mm", new Date()), "h:mm a");
      } catch {
        return time;
      }
    };

    return `${formatTimeValue(start)} - ${formatTimeValue(end)}`;
  };

  return (
    <>
      <div className="flex w-full max-w-full flex-col gap-4 p-4">
        {/* Page Header */}
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <h2 className="font-inter text-xl font-semibold leading-[100%] text-[#1D1F2C]">
              Business Hours
            </h2>

            <p className="mt-1 text-sm text-[#777980]">
              Manage your business operating hours.
            </p>
          </div>
        </div>

        {/* Business Hours Card */}
        <div className="flex flex-col gap-6 rounded-lg border border-[#DFE1E7] bg-[#F8FAFB] p-6">
          {/* Card Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#1D2939]">
              Business Hours
            </h3>

            <Button
              onClick={handleOpenBusinessHoursModal}
              permission={PERMISSIONS.section.create}
              disabled={isLoading || isFetching}
              className="flex w-auto! items-center gap-2 rounded-md bg-[#0098E8] px-4 py-2 text-white transition-colors hover:bg-[#0088D8] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon name="plus" width={16} height={16} color="white" />

              {isFetching
                ? "Loading..."
                : businessHours
                ? "Edit Hours"
                : "Create Hours"}
            </Button>
          </div>

          {/* Loading */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-lg border border-[#DFE1E7] bg-white p-4"
                >
                  <div className="h-4 w-24 rounded bg-gray-200" />

                  <div className="mt-3 h-5 w-32 rounded bg-gray-200" />
                </div>
              ))}
            </div>
          ) : !businessHours ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-[#DFE1E7] bg-white p-8 text-center">
              <p className="text-sm font-medium text-[#667085]">
                No business hours configured yet.
              </p>
              <Button
                onClick={handleOpenBusinessHoursModal}
                permission={PERMISSIONS.section.create}
                className="flex w-auto! items-center gap-2 rounded-md bg-[#0098E8] px-4 py-2 text-sm text-white transition-colors hover:bg-[#0088D8]"
              >
                <Icon name="plus" width={14} height={14} color="white" />
                Create Business Hours
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Sunday */}
              <div className="rounded-lg border border-[#DFE1E7] bg-white p-4">
                <p className="text-sm font-medium text-[#667085]">Sunday</p>

                <p className="mt-2 text-base font-semibold text-[#1D2939]">
                  {businessHours.content?.sunday?.start_time &&
                  businessHours.content?.sunday?.end_time
                    ? formatTime(
                        businessHours.content.sunday.start_time,
                        businessHours.content.sunday.end_time,
                      )
                    : "--:-- - --:--"}
                </p>
              </div>

              {/* Monday - Thursday */}
              <div className="rounded-lg border border-[#DFE1E7] bg-white p-4">
                <p className="text-sm font-medium text-[#667085]">
                  Monday - Thursday
                </p>

                <p className="mt-2 text-base font-semibold text-[#1D2939]">
                  {businessHours.content?.mondayThursday?.start_time &&
                  businessHours.content?.mondayThursday?.end_time
                    ? formatTime(
                        businessHours.content.mondayThursday.start_time,
                        businessHours.content.mondayThursday.end_time,
                      )
                    : "--:-- - --:--"}
                </p>
              </div>

              {/* Friday - Saturday */}
              <div className="rounded-lg border border-[#DFE1E7] bg-white p-4">
                <p className="text-sm font-medium text-[#667085]">
                  Friday - Saturday
                </p>

                <p className="mt-2 text-base font-semibold text-[#1D2939]">
                  {businessHours.content?.fridaySaturday?.start_time &&
                  businessHours.content?.fridaySaturday?.end_time
                    ? formatTime(
                        businessHours.content.fridaySaturday.start_time,
                        businessHours.content.fridaySaturday.end_time,
                      )
                    : "--:-- - --:--"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit/Create Modal */}
      <EditBusinessHoursModal
        isOpen={isModalOpen}
        hours={hours}
        isUpdating={isUpdating}
        isCreating={!businessHours}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBusinessHours}
        onChange={handleTimeChange}
      />
    </>
  );
}
