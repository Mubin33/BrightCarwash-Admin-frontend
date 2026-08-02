'use client';

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
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

    const [form, setForm] = useState<ComposeEmailFormState>({
        ...initialState,
        to: emailFromUrl || "",
    });

    const [sendEmail, { isLoading: isSending }] = useSendEmailMutation();

    const updateField = useCallback(<K extends keyof ComposeEmailFormState>(
        key: K,
        value: ComposeEmailFormState[K]
    ) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    }, []);

    const addFiles = useCallback((newFiles: FileList) => {
        setForm((prev) => ({
            ...prev,
            files: [...prev.files, ...Array.from(newFiles)],
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

        // ✅ Validate CC if provided
        if (form.cc && form.cc.trim() && !emailRegex.test(form.cc.trim())) {
            toast.warning("Please enter a valid CC email address");
            return;
        }

        // ✅ Validate BCC if provided
        if (form.bcc && form.bcc.trim() && !emailRegex.test(form.bcc.trim())) {
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
                cc: form.cc.trim() ? [form.cc.trim()] : undefined,  // ✅ Array or undefined
                bcc: form.bcc.trim() ? [form.bcc.trim()] : undefined,  // ✅ Array or undefined
                subject: form.subject,
                body: form.body,
                files: form.files.length > 0 ? form.files : undefined,
            };

            await sendEmail(payload).unwrap();

            toast.success("Email sent successfully!");
            router.push("/marketing/email-list");
        } catch (error: any) {
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