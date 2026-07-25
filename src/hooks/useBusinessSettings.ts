"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { APP_CONFIG } from "@/configs/app.config";
import { getAccessToken } from "@/lib/auth-client";
import { useUpdateBusinessProfileMutation } from "@/services/settings.api";
import type { BusinessProfileData } from "@/services/settings.api";

export function useBusinessSettings(initialData: BusinessProfileData) {
    const [form, setForm] = useState<BusinessProfileData>(initialData);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(initialData.logo);
    const [isUploading, setIsUploading] = useState(false);
    const [updateBusinessProfile, { isLoading: isSaving }] = useUpdateBusinessProfileMutation();

    useEffect(() => {
        if (initialData) {
            setForm(initialData);
            setLogoPreview(initialData.logo);
        }
    }, [initialData]);

    const updateField = useCallback(<K extends keyof BusinessProfileData>(key: K, value: BusinessProfileData[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    }, []);

    // Logo upload happens immediately (like avatar), since sections store a URL not a binary file
    const handleLogoUpload = useCallback(async (file: File) => {
        setIsUploading(true);
        try {
            const token = getAccessToken();
            const formData = new FormData();
            formData.append('files', file);

            const res = await fetch(`${APP_CONFIG.API_BASE_URL}/admin/files/upload`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (!res.ok) throw new Error('Upload failed');
            const json = await res.json();
            const uploaded = json.data?.[0] || json.data;
            const url = uploaded.path

            setLogoPreview(url);
            updateField("logo", url);
            toast.success("Logo uploaded");
        } catch {
            toast.error("Failed to upload logo");
        } finally {
            setIsUploading(false);
        }
    }, [updateField]);

    const handleDeleteLogo = useCallback(() => {
        setLogoPreview(null);
        updateField("logo", null);
        toast.success("Logo removed");
    }, [updateField]);

    const handleSave = useCallback(async () => {
        try {
            await updateBusinessProfile({
                logo: form.logo,
                business_name: form.business_name.trim(),
                tagline: form.tagline.trim(),
            }).unwrap();
            toast.success("Business profile updated");
        } catch {
            toast.error("Failed to update business profile");
        }
    }, [form, updateBusinessProfile]);

    return {
        form,
        logo: logoPreview,
        isSaving,
        isUploading,
        updateField,
        handleLogoUpload,
        handleDeleteLogo,
        handleSave,
    };
}