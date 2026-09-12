"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { toast } from "react-toastify";
import { PERMISSIONS } from "@/lib/permissions";
import { format, parse } from "date-fns";

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
      start_time: "",
      end_time: "",
    },
    mondayThursday: {
      start_time: "",
      end_time: "",
    },
    fridaySaturday: {
      start_time: "",
      end_time: "",
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
  const handleEditBusinessHours = () => {
    if (!businessHours) {
      toast.error("Timing data not found");
      return;
    }

    setHours({
      sunday: {
        start_time: businessHours.content?.sunday?.start_time || "",
        end_time: businessHours.content?.sunday?.end_time || "",
      },

      mondayThursday: {
        start_time: businessHours.content?.mondayThursday?.start_time || "",
        end_time: businessHours.content?.mondayThursday?.end_time || "",
      },

      fridaySaturday: {
        start_time: businessHours.content?.fridaySaturday?.start_time || "",
        end_time: businessHours.content?.fridaySaturday?.end_time || "",
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

  // Update API
  const handleUpdateBusinessHours = async () => {
    if (!businessHours) {
      toast.error("Timing data not found");
      return;
    }

    try {
      await editBusinessHours({
        section_name: "business_hours",

        body: {
          section_key: businessHours.section_key,
          section_type: businessHours.section_type,

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

          is_active: businessHours.is_active,
          sort_order: businessHours.sort_order,
        },
      }).unwrap();

      toast.success("Timing updated successfully");

      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to update Timing:", error);

      toast.error("Failed to update Timing");
    }
  };

  // Date Time Format
  const formatTime = (start: string, end: string) => {
    const formatTimeValue = (time: string) => {
      return format(parse(time, "HH:mm", new Date()), "h:mm a");
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
              onClick={handleEditBusinessHours}
              permission={PERMISSIONS.section.create}
              disabled={isLoading || isFetching || !businessHours}
              className="flex w-auto! items-center gap-2 rounded-md bg-[#0098E8] px-4 py-2 text-white transition-colors hover:bg-[#0088D8] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon name="plus" width={16} height={16} color="white" />

              {isFetching ? "Loading..." : "Edit Hours"}
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
            <div className="rounded-lg border border-[#DFE1E7] bg-white p-6 text-center text-sm text-[#667085]">
              No Timing found.
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

      {/* Edit Modal */}
      <EditBusinessHoursModal
        isOpen={isModalOpen}
        hours={hours}
        isUpdating={isUpdating}
        onClose={() => setIsModalOpen(false)}
        onSave={handleUpdateBusinessHours}
        onChange={handleTimeChange}
      />
    </>
  );
}
