"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  useCreateSectionMutation,
  useUpdateSectionMutation,
} from "@/services/sections.api";
import type { Section } from "@/types/section";
import type {
  CreateSectionRequest,
  UpdateSectionRequest,
} from "@/types/section";
import { toast } from "react-toastify";

interface SectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  section?: Section | null;
  onSuccess: () => void;
}

const SECTION_TYPES = [
  { value: "hero", label: "Hero" },
  { value: "testimonial", label: "Testimonial" },
  { value: "faq", label: "FAQ" },
  { value: "gallery", label: "Gallery" },
  { value: "other", label: "Other" },
];

export function SectionModal({
  isOpen,
  onClose,
  section,
  onSuccess,
}: SectionModalProps) {
  const [sectionKey, setSectionKey] = useState("");
  const [sectionType, setSectionType] = useState("hero");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const [createSection] = useCreateSectionMutation();
  const [updateSection] = useUpdateSectionMutation();

  useEffect(() => {
    if (section) {
      setSectionKey(section.section_key);
      setSectionType(section.section_type);
      setTitle(section.content.title || "");
      setSubtitle(section.content.subtitle || "");
      setBackgroundImageUrl(
        section.content.background_image_url ||
          (typeof section.content.backgroundImageUrl === "string"
            ? section.content.backgroundImageUrl
            : Array.isArray(section.content.backgroundImageUrl)
              ? section.content.backgroundImageUrl[0] || ""
              : "") ||
          "",
      );
      setIsActive(section.is_active);
      setSortOrder(section.sort_order || 1);
    } else {
      setSectionKey("");
      setSectionType("hero");
      setTitle("");
      setSubtitle("");
      setBackgroundImageUrl("");
      setIsActive(true);
      setSortOrder(1);
    }
  }, [section, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!sectionKey.trim() || !sectionType.trim() || !title.trim()) {
      toast.warning("Section key, type, and title are required");
      return;
    }

    setIsSubmitting(true);

    const payload: UpdateSectionRequest = {
      section_type: sectionType.trim(),
      content: {
        title: title.trim(),
        subtitle: subtitle.trim(),
        background_image_url: backgroundImageUrl.trim() || undefined,
      },
      is_active: isActive,
      sort_order: sortOrder,
    };

    try {
        if (section) {
        await updateSection({
          // send flattened payload so backend receives fields at root
          key: section.section_key,
          ...payload,
        }).unwrap();
        toast.success("Section updated successfully");
      } else {
        const createPayload: CreateSectionRequest = {
          key: sectionKey.trim(),
          section_key: sectionKey.trim(),
          section_type: sectionType.trim(),
          content: {
            title: title.trim(),
            subtitle: subtitle.trim(),
            background_image_url: backgroundImageUrl.trim() || undefined,
          },
          is_active: isActive,
          sort_order: sortOrder,
        };
        await createSection(createPayload).unwrap();
        toast.success("Section created successfully");
      }
      onSuccess();
    } catch {
      toast.error(
        section ? "Failed to update section" : "Failed to create section",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
        onClick={handleClose}
      />
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-140 bg-white z-50 shadow-xl transition-transform duration-300 ease-out ${isVisible ? "translate-x-0" : "translate-x-full"}`}
        ref={modalRef}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[#1D1F2C] font-inter text-2xl font-semibold leading-[132%]">
              {section ? "Edit Section" : "New Section"}
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-[#F8FAFB] transition-colors"
              aria-label="Close modal"
            >
              <X size={24} className="text-[#4A4C56]" />
            </button>
          </div>
          <div className="w-full h-px bg-[#DFE1E7] my-4" />
          <form
            onSubmit={handleSubmit}
            className="flex-1 flex flex-col gap-4 overflow-y-auto py-4"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="section-key"
                  className="text-[#777980] font-inter text-base font-normal leading-[130%]"
                >
                  Section Key
                </label>
                <div className="flex items-center justify-between p-4 bg-[#F8FAFB] rounded-lg border border-[#DFE1E7]">
                  <input
                    id="section-key"
                    type="text"
                    value={sectionKey}
                    onChange={(e) => setSectionKey(e.target.value)}
                    placeholder="home_hero"
                    disabled={!!section}
                    className="flex-1 bg-transparent border-none outline-none text-[#4A4C56] font-inter text-base font-normal leading-[150%] placeholder-[#A5A5AB]"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="section-type"
                  className="text-[#777980] font-inter text-base font-normal leading-[130%]"
                >
                  Section Type
                </label>
                <div className="flex items-center justify-between p-4 bg-[#F8FAFB] rounded-lg border border-[#DFE1E7]">
                  <select
                    id="section-type"
                    value={sectionType}
                    onChange={(e) => setSectionType(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-[#4A4C56] font-inter text-base font-normal leading-[150%]"
                  >
                    {SECTION_TYPES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2 col-span-2">
                <label
                  htmlFor="section-title"
                  className="text-[#777980] font-inter text-base font-normal leading-[130%]"
                >
                  Title
                </label>
                <div className="flex items-center justify-between p-4 bg-[#F8FAFB] rounded-lg border border-[#DFE1E7]">
                  <input
                    id="section-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Premium Car Wash"
                    className="flex-1 bg-transparent border-none outline-none text-[#4A4C56] font-inter text-base font-normal leading-[150%] placeholder-[#A5A5AB]"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 col-span-2">
                <label
                  htmlFor="section-subtitle"
                  className="text-[#777980] font-inter text-base font-normal leading-[130%]"
                >
                  Subtitle
                </label>
                <div className="flex items-center justify-between p-4 bg-[#F8FAFB] rounded-lg border border-[#DFE1E7]">
                  <textarea
                    id="section-subtitle"
                    rows={3}
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Fast, clean, and eco-friendly service"
                    className="flex-1 bg-transparent border-none outline-none text-[#4A4C56] font-inter text-base font-normal leading-[150%] placeholder-[#A5A5AB]"
                  />
                </div>
              </div>
            </div>

            {/* <div className="flex flex-col gap-2">
              <label
                htmlFor="background-image-url"
                className="text-[#777980] font-inter text-base font-normal leading-[130%]"
              >
                Background Image URL
              </label>
              <div className="flex items-center justify-between p-4 bg-[#F8FAFB] rounded-lg border border-[#DFE1E7]">
                <input
                  id="background-image-url"
                  type="text"
                  value={backgroundImageUrl}
                  onChange={(e) => setBackgroundImageUrl(e.target.value)}
                  placeholder="/storage/section-media/home-hero.jpg"
                  className="flex-1 bg-transparent border-none outline-none text-[#4A4C56] font-inter text-base font-normal leading-[150%] placeholder-[#A5A5AB]"
                />
              </div>
            </div> */}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* <div className="flex flex-col gap-2">
                <label
                  htmlFor="section-sort-order"
                  className="text-[#777980] font-inter text-base font-normal leading-[130%]"
                >
                  Sort Order
                </label>
                <div className="flex items-center justify-between p-3 bg-[#F8FAFB] rounded-lg border border-[#DFE1E7]">
                  <input
                    id="section-sort-order"
                    type="number"
                    min={1}
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full bg-transparent border-none outline-none text-[#4A4C56] font-inter text-base font-normal leading-[150%]"
                  />
                </div>
              </div> */}
              <div className="md:col-span-2 flex flex-col gap-2">
                <label className="text-[#777980] font-inter text-base font-normal leading-[130%]">
                  Status
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsActive(false)}
                    className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                      !isActive
                        ? "bg-[#F7EBEA] border-[#B23730]"
                        : "bg-white border-[#ECEFF3] hover:border-[#DFE1E7]"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        !isActive ? "border-[#B23730]" : "border-[#E8E8E9]"
                      }`}
                    >
                      {!isActive && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#B23730]" />
                      )}
                    </div>
                    <span className="text-[#1D1F2C] font-inter text-lg font-normal leading-[132%]">
                      Draft
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsActive(true)}
                    className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                      isActive
                        ? "bg-[#DCF7EA] border-[#006F1F]"
                        : "bg-white border-[#ECEFF3] hover:border-[#DFE1E7]"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isActive ? "border-[#006F1F]" : "border-[#E8E8E9]"
                      }`}
                    >
                      {isActive && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#006F1F]" />
                      )}
                    </div>
                    <span className="text-[#1D1F2C] font-inter text-lg font-normal leading-[132%]">
                      Published
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 mt-auto border-t border-[#DFE1E7]">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 py-3"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                loadingText={section ? "Saving..." : "Creating..."}
                className="flex-1 py-3"
              >
                {section ? "Save Changes" : "Save Section"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
