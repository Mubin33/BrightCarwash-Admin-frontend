"use client";

import { Button } from "@/components/ui/Button";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import { IMAGE_ACCEPT } from "@/lib/file-validation";
import { useGetBusinessProfileQuery } from "@/services/settings.api";
import { AlertCircle, RefreshCw, Upload } from "lucide-react";
import Image from "next/image";

const labelClass = "text-[#777980] font-inter text-base font-normal leading-5";
const inputClass =
  "w-full px-4 py-3 bg-white rounded-lg border border-[#DFE1E7] text-[#1B1B1B] font-inter text-base outline-none focus:border-[#0098E8] transition-all";

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL;

export function BusinessSettings() {
  const {
    data: initialData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetBusinessProfileQuery();

  const isLoaded = !isLoading && !isError && !!initialData;

  const {
    form,
    logo,
    isUploading,
    isSaving,
    updateField,
    handleLogoUpload,
    handleDeleteLogo,
    handleSave,
  } = useBusinessSettings(
    initialData || {
      logo: null,
      business_name: "",
      tagline: "",
    },
    isLoaded,
  );

  if (isLoading) {
    return <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />;
  }

  if (isError) {
    return (
      <div className="p-6 bg-[#F8FAFB] rounded-lg border border-[#DFE1E7] flex flex-col gap-6">
        <h2 className="text-[#1B1B1B] font-inter text-lg font-semibold">
          Business Profile Update
        </h2>
        <div
          role="alert"
          className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 font-inter text-sm flex items-start gap-3"
        >
          <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-semibold">Failed to load business profile</span>
            <span className="text-xs text-red-600">
              {typeof error === "object" && error && "data" in error
                ? String((error as { data: unknown }).data)
                : "An unexpected error occurred while loading your profile. Please try again."}
            </span>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors w-fit"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#F8FAFB] rounded-lg border border-[#DFE1E7] flex flex-col gap-6">
      <h2 className="text-[#1B1B1B] font-inter text-lg font-semibold">
        Business Profile Update
      </h2>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <label className={labelClass}>Business Logo</label>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg border border-dashed border-[#DFE1E7] bg-white overflow-hidden relative flex items-center justify-center">
              {logo ? (
                <Image
                  src={`${STORAGE_URL}${logo}`}
                  alt="Business logo"
                  fill
                  className="object-cover"
                />
              ) : (
                <Upload size={18} className="text-[#777980]" />
              )}
            </div>
            <label className="flex py-2.5 px-4 rounded-lg border border-[#DFE1E7] text-[#1B1B1B] font-inter text-sm cursor-pointer hover:bg-[#F1F1F1] transition-colors">
              {isUploading ? "Uploading..." : "Upload logo"}
              <input
                type="file"
                accept={IMAGE_ACCEPT}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleLogoUpload(file);
                  }
                  e.target.value = "";
                }}
                className="hidden"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={handleDeleteLogo}
            className="text-[#FF4345] font-inter text-sm text-left w-fit hover:underline"
          >
            Delete logo
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClass}>Business Name</label>
          <input
            type="text"
            value={form.business_name}
            onChange={(e) => updateField("business_name", e.target.value)}
            placeholder="Brightside Car Wash"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClass}>Tagline</label>
          <input
            type="text"
            value={form.tagline}
            onChange={(e) => updateField("tagline", e.target.value)}
            placeholder="Spotless. Every time."
            className={inputClass}
          />
          <span className="text-[#A6A8AE] font-inter text-sm">
            Appears as the subtitle in the website header and receipts
          </span>
        </div>
      </div>

      <div>
        <Button
          onClick={handleSave}
          disabled={!isLoaded || isSaving}
          isLoading={isSaving}
          loadingText="Saving..."
          className="flex py-2.5 px-4 items-center gap-2 rounded bg-[#0098E8] text-white font-inter text-sm hover:bg-[#0088D8] transition-colors w-auto!"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
