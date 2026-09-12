"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { Template } from "@/types/template";

interface TemplatePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    template: Template | null;
    onUse: (template: Template) => void;
}

export function TemplatePreviewModal({ isOpen, onClose, template, onUse }: TemplatePreviewModalProps) {
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const [iframeError, setIframeError] = useState(false);

    // Reset state when modal opens with new template
    useEffect(() => {
        if (isOpen) {
            setIframeLoaded(false);
            setIframeError(false);
        }
    }, [isOpen, template?.id]);

    if (!template) return null;

    const htmlContent = template.html || template.emailBody?.htmlContent || '<div style="padding:40px;color:#999;">No content available</div>';

    const modalTitle = (
        <div className="flex items-center justify-between self-stretch">
            <span className="text-[#1D1F2C] font-inter text-lg font-semibold">{template.name}</span>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="lg" bodyClassName="py-3">
            <div className="flex flex-col gap-4">
                <div className="w-full h-px bg-[#DFE1E7]" />

                {/* Preview iframe */}
                <div className="w-full h-[400px] rounded-xl border border-[#DFE1E7] overflow-hidden bg-white relative">
                    {!iframeLoaded && !iframeError && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 border-2 border-[#0098E8] border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                    {iframeError ? (
                        <div className="absolute inset-0 flex items-center justify-center text-[#777980] font-inter">
                            <div className="text-center">
                                <p className="text-lg font-medium">Preview unavailable</p>
                                <p className="text-sm mt-1">The template content could not be loaded</p>
                            </div>
                        </div>
                    ) : (
                        <iframe
                            srcDoc={htmlContent}
                            title={template.name}
                            className="w-full h-full"
                            sandbox="allow-same-origin"
                            style={{ transform: "scale(0.5)", transformOrigin: "0 0", width: "200%", height: "200%" }}
                            onLoad={() => setIframeLoaded(true)}
                            onError={() => {
                                setIframeError(true);
                                setIframeLoaded(true);
                            }}
                        />
                    )}
                </div>

                <div className="flex gap-3 justify-end pt-2">
                    <Button type="button" variant="outline" onClick={onClose} className="px-6 w-auto!">Back</Button>
                    <Button onClick={() => onUse(template)} className="px-6 w-auto!">Use Template</Button>
                </div>
            </div>
        </Modal>
    );
}