"use client";

import { apiFetch } from "@/lib/api-fetch";
import { useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { validateImageFile } from "@/lib/file-validation";
import { useUpdateBusinessProfileMutation } from "@/services/settings.api";
import type { BusinessProfileData } from "@/services/settings.api";

/**
 * AU14 / A-20: Data preservation helper.
 * Blocks saving if load has not succeeded (returns null).
 * If load succeeded, calculates and returns only the edited fields.
 */
export function getEditedBusinessProfileFields(
    form: BusinessProfileData,
    initialData: BusinessProfileData,
    isLoaded: boolean
): Partial<BusinessProfileData> | null {
    if (!isLoaded) {
        return null;
    }

    const editedFields: Partial<BusinessProfileData> = {};
    if (form.logo !== initialData.logo) {
        editedFields.logo = form.logo;
    }
    if (form.business_name.trim() !== (initialData.business_name || "").trim()) {
        editedFields.business_name = form.business_name.trim();
    }
    if (form.tagline.trim() !== (initialData.tagline || "").trim()) {
        editedFields.tagline = form.tagline.trim();
    }

    return editedFields;
}

export function useBusinessSettings(initialData: BusinessProfileData, isLoaded = true) {
    const [form, setForm] = useState<BusinessProfileData>(initialData);
    const [logoPreview, setLogoPreview] = useState<string | null>(initialData.logo);
    const [isUploading, setIsUploading] = useState(false);
    const [updateBusinessProfile, { isLoading: isSaving }] = useUpdateBusinessProfileMutation();

    useEffect(() => {
        if (initialData && isLoaded) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setForm(initialData);
            setLogoPreview(initialData.logo);
        }
    }, [initialData, isLoaded]);

    const updateField = useCallback(<K extends keyof BusinessProfileData>(key: K, value: BusinessProfileData[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    }, []);

    // Logo upload happens immediately (like avatar), since sections store a URL not a binary file
    const handleLogoUpload = useCallback(async (file: File) => {
        const validation = validateImageFile(file);
        if (!validation.isValid) {
            toast.error(validation.error);
            return;
        }
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('files', file);

            const res = await apiFetch('/admin/files/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Upload failed');
            const json = await res.json();
            const uploaded = json.data?.[0] || json.data;
            const url = uploaded.path;

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
        // AU14 / A-20: Block saving until load has succeeded. If load failed, make zero update calls.
        const editedFields = getEditedBusinessProfileFields(form, initialData, isLoaded);
        if (editedFields === null) {
            toast.error("Cannot save: business profile has not loaded successfully");
            return;
        }

        // AU14 / A-20: If no fields changed, make zero update calls
        if (Object.keys(editedFields).length === 0) {
            toast.info("No changes to save");
            return;
        }

        try {
            // Send full profile data to prevent backend from wiping untouched fields (logo, business name)
            await updateBusinessProfile({
                logo: form.logo,
                business_name: form.business_name.trim(),
                tagline: form.tagline.trim(),
            }).unwrap();
            toast.success("Business profile updated");
        } catch {
            toast.error("Failed to update business profile");
        }
    }, [isLoaded, form, initialData, updateBusinessProfile]);

    return {
        form,
        logo: logoPreview,
        isSaving,
        isUploading,
        isLoaded,
        updateField,
        handleLogoUpload,
        handleDeleteLogo,
        handleSave,
    };
}
