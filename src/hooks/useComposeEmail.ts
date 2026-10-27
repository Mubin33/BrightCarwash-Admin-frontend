'use client';

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { validateAttachmentFile } from "@/lib/file-validation";
import { useSendEmailMutation } from "@/services/email-list.api";
import type { ComposeEmailFormState } from "@/types/email-list";

const initialState: ComposeEmailFormState = {
    from: "",
    to: "",
    cc: "",
    bcc: "",
    subject: "",
    body: "",
    files: [],
    useTemplate: false,
    templateId: "",
    showCcBcc: false,
};

export function useComposeEmail() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailFromUrl = searchParams.get("to");

    const [form, setForm] = useState<ComposeEmailFormState>(() => {
        let initialTo = "";
        if (typeof window !== "undefined") {
            const stored = sessionStorage.getItem("compose_email_recipient");
            if (stored) {
                initialTo = stored;
                sessionStorage.removeItem("compose_email_recipient");
            }
        }
        return {
            ...initialState,
            to: initialTo || emailFromUrl || "",
        };
    });

    const [sendEmail, { isLoading: isSending }] = useSendEmailMutation();

    const updateField = useCallback(<K extends keyof ComposeEmailFormState>(
        key: K,
        value: ComposeEmailFormState[K]
    ) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    }, []);

    const addFiles = useCallback((newFiles: FileList) => {
        const fileArray = Array.from(newFiles);
        const validFiles: File[] = [];
        for (const file of fileArray) {
            const validation = validateAttachmentFile(file);
            if (!validation.isValid) {
                toast.error(validation.error || `Invalid file: ${file.name}`);
                return;
            }
            validFiles.push(file);
        }
        setForm((prev) => ({
            ...prev,
            files: [...prev.files, ...validFiles],
        }));
    }, []);

    const removeFile = useCallback((index: number) => {
        setForm((prev) => ({
            ...prev,
            files: prev.files.filter((_, i) => i !== index),
        }));
    }, []);

    const toggleCcBcc = useCallback(() => {
        setForm((prev) => ({ ...prev, showCcBcc: !prev.showCcBcc }));
    }, []);

    const handleSend = useCallback(async () => {
        // ✅ Validate single email
        if (!form.to || !form.to.trim()) {
            toast.warning("Please enter a recipient email address");
            return;
        }

        // ✅ Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.to.trim())) {
            toast.warning("Please enter a valid email address");
            return;
        }

        const parseEmails = (value: string): string[] =>
            value
                .split(/[,;\s]+/)
                .map((e) => e.trim())
                .filter(Boolean);

        // ✅ Validate CC if provided
        const ccList = form.cc && form.cc.trim() ? parseEmails(form.cc) : [];
        if (ccList.some((email) => !emailRegex.test(email))) {
            toast.warning("Please enter a valid CC email address");
            return;
        }

        // ✅ Validate BCC if provided
        const bccList = form.bcc && form.bcc.trim() ? parseEmails(form.bcc) : [];
        if (bccList.some((email) => !emailRegex.test(email))) {
            toast.warning("Please enter a valid BCC email address");
            return;
        }

        if (!form.subject.trim()) {
            toast.warning("Please enter a subject");
            return;
        }

        if (!form.body.trim() || form.body === "<p></p>") {
            toast.warning("Please enter email body");
            return;
        }

        try {
            // ✅ Send as per SendEmailRequest types
            const payload = {
                to: form.to.trim(),  // ✅ Single string, not array
                cc: ccList.length > 0 ? ccList : undefined,  // ✅ Array or undefined
                bcc: bccList.length > 0 ? bccList : undefined,  // ✅ Array or undefined
                subject: form.subject,
                body: form.body,
                files: form.files.length > 0 ? form.files : undefined,
            };

            await sendEmail(payload).unwrap();

            toast.success("Email sent successfully!");
            router.push("/marketing/email-list");
        } catch (err) {
            const error = err as { data?: { message?: string } };
            toast.error(error?.data?.message || "Failed to send email");
        }
    }, [form, sendEmail, router]);

    return {
        form,
        isSending,
        updateField,
        addFiles,
        removeFile,
        toggleCcBcc,
        handleSend,
    };
}

