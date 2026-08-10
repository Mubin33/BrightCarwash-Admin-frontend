"use client";

import { useEffect, useRef, useState } from "react";
import { X, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "react-toastify";
import {
  useCreateFaqMutation,
  useUpdateFaqMutation,
  type WashWithPurposeFaq,
} from "@/services/washWithPurpose.api";

interface WashWithPurposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  faq?: WashWithPurposeFaq | null;
  onSuccess: () => void;
}

export function WashWithPurposeModal({
  isOpen,
  onClose,
  faq,
  onSuccess,
}: WashWithPurposeModalProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isPublish, setIsPublish] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(1);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [createFaq] = useCreateFaqMutation();
  const [updateFaq] = useUpdateFaqMutation();

  // Reset form when modal opens with FAQ data
  useEffect(() => {
    if (faq) {
      setQuestion(faq.question || "");
      setAnswer(faq.ans || "");
      setIsPublish(faq.is_publish ?? true);
      setDisplayOrder(faq.display_order || 1);
      setIconPreview(faq.icon || "");
      setIconFile(null);
    } else {
      setQuestion("");
      setAnswer("");
      setIsPublish(true);
      setDisplayOrder(1);
      setIconPreview("");
      setIconFile(null);
    }
  }, [faq, isOpen]);

  // Animation control
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Click outside handler
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveIcon = () => {
    setIconFile(null);
    setIconPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!question.trim() || !answer.trim()) {
      toast.warning("Question and answer are required");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("question", question.trim());
      formData.append("ans", answer.trim());
      formData.append("is_publish", String(isPublish));
      formData.append("display_order", String(displayOrder));

      if (iconFile) {
        formData.append("icon", iconFile);
      }

      if (faq) {
        await updateFaq({ id: faq.id, formData }).unwrap();
        toast.success("FAQ updated successfully");
      } else {
        await createFaq(formData).unwrap();
        toast.success("FAQ created successfully");
      }

      onSuccess();
      handleClose();
    } catch (error) {
      toast.error(faq ? "Failed to update FAQ" : "Failed to create FAQ");
      console.error("FAQ submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-140 bg-white z-50 shadow-xl transition-transform duration-300 ease-out ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
        ref={modalRef}
      >
        <div className="flex flex-col h-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-3">
            <div className="text-[#1D1F2C] font-inter text-2xl font-semibold leading-[132%]">
              {faq ? "Edit FAQ" : "New FAQ"}
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

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 flex flex-col gap-4 overflow-y-auto py-4"
          >
            {/* Question */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="faq-question"
                className="text-[#777980] font-inter text-base font-normal leading-[130%]"
              >
                Question *
              </label>
              <div className="flex items-center justify-between p-4 bg-[#F8FAFB] rounded-lg border border-[#DFE1E7]">
                <input
                  id="faq-question"
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What is Wash with Purpose?"
                  className="flex-1 bg-transparent border-none outline-none text-[#4A4C56] font-inter text-base font-normal leading-[150%] placeholder-[#A5A5AB]"
                />
              </div>
            </div>

            {/* Answer */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="faq-answer"
                className="text-[#777980] font-inter text-base font-normal leading-[130%]"
              >
                Answer *
              </label>
              <div className="flex items-center justify-between p-4 bg-[#F8FAFB] rounded-lg border border-[#DFE1E7]">
                <textarea
                  id="faq-answer"
                  rows={5}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Wash with Purpose is..."
                  className="flex-1 bg-transparent border-none outline-none text-[#4A4C56] font-inter text-base font-normal leading-[150%] placeholder-[#A5A5AB] resize-none"
                />
              </div>
            </div>

            {/* Icon Upload */}
            <div className="flex flex-col gap-2">
              <label className="text-[#777980] font-inter text-base font-normal leading-[130%]">
                Icon
              </label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-3 bg-[#F8FAFB] rounded-lg border border-[#DFE1E7] hover:bg-[#F0F2F5] transition-colors"
                >
                  <Upload size={20} className="text-[#4A4C56]" />
                  <span className="text-[#4A4C56] font-inter text-base font-normal">
                    {iconFile ? "Change Icon" : "Upload Icon"}
                  </span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {(iconPreview || faq?.icon) && (
                  <button
                    type="button"
                    onClick={handleRemoveIcon}
                    className="text-[#B23730] hover:text-[#8A2A24] font-inter text-sm font-medium transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Icon Preview */}
              {(iconPreview || faq?.icon) && (
                <div className="mt-2">
                  <img
                    src={iconPreview || faq?.icon || ""}
                    alt="FAQ Icon"
                    className="w-16 h-16 object-contain rounded-lg border border-[#DFE1E7]"
                  />
                </div>
              )}
            </div>
            {/* Publish Status */}
            <div className="flex flex-col gap-2">
              <label className="text-[#777980] font-inter text-base font-normal leading-[130%]">
                Status
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPublish(false)}
                  className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                    !isPublish
                      ? "bg-[#F7EBEA] border-[#B23730]"
                      : "bg-white border-[#ECEFF3] hover:border-[#DFE1E7]"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      !isPublish ? "border-[#B23730]" : "border-[#E8E8E9]"
                    }`}
                  >
                    {!isPublish && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#B23730]" />
                    )}
                  </div>
                  <span className="text-[#1D1F2C] font-inter text-lg font-normal leading-[132%]">
                    Draft
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPublish(true)}
                  className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                    isPublish
                      ? "bg-[#DCF7EA] border-[#006F1F]"
                      : "bg-white border-[#ECEFF3] hover:border-[#DFE1E7]"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isPublish ? "border-[#006F1F]" : "border-[#E8E8E9]"
                    }`}
                  >
                    {isPublish && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#006F1F]" />
                    )}
                  </div>
                  <span className="text-[#1D1F2C] font-inter text-lg font-normal leading-[132%]">
                    Published
                  </span>
                </button>
              </div>
            </div>

            {/* Actions */}
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
                loadingText={faq ? "Saving..." : "Creating..."}
                className="flex-1 py-3"
              >
                {faq ? "Save Changes" : "Create FAQ"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
