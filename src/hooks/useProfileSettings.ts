"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import {
  useUpdateProfileMutation,
  useGetProfileQuery,
} from "@/services/settings.api";
import { useAppDispatch } from "@/lib/store";
import { setUser } from "@/store/slices/authSlice";
import * as authService from "@/services/auth.service";
import type { ProfileFormData } from "@/types/settings";
import {
  formatUSPhoneNumber,
  toBackendPhoneFormat,
  fromBackendPhoneFormat,
  sanitizeNameInput,
} from "@/lib/inputFormatters";

export function useProfileSettings(initialData: ProfileFormData) {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState<ProfileFormData>({
    ...initialData,
    phone: fromBackendPhoneFormat(initialData.phone),
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    initialData.avatar,
  );
  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();
  const { refetch } = useGetProfileQuery();
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current && initialData.first_name) {
      setForm({
        ...initialData,
        phone: fromBackendPhoneFormat(initialData.phone),
      });
      setAvatarPreview(initialData.avatar);
      isInitialized.current = true;
    }
  }, [
    initialData.first_name,
    initialData.last_name,
    initialData.email,
    initialData.phone,
    initialData.avatar,
  ]);

  const updateField = useCallback(
    <K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const updateNameField = useCallback(
    (key: "first_name" | "last_name", value: string) => {
      setForm((prev) => ({ ...prev, [key]: sanitizeNameInput(value) }));
    },
    [],
  );

  const updatePhoneField = useCallback((value: string) => {
    setForm((prev) => ({ ...prev, phone: formatUSPhoneNumber(value) }));
  }, []);

  const handleAvatarUpload = useCallback((file: File) => {
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }, []);

  const handleDeleteAvatar = useCallback(() => {
    setAvatarFile(null);
    setAvatarPreview(null);
    updateField("avatar", null);
  }, [updateField]);

  const handleSave = useCallback(async () => {
    try {
      await updateProfile({
        firstName: form.first_name.trim(),
        lastName: form.last_name.trim(),
        phoneNumber: toBackendPhoneFormat(form.phone),
        image: avatarFile,
      }).unwrap();

      toast.success("Profile updated");
      setAvatarFile(null);
      refetch();

      // Sync updated profile with Redux state for Navbar
      const updatedProfile = await authService.getProfile();
      dispatch(setUser(updatedProfile));
    } catch {
      toast.error("Failed to update profile");
    }
  }, [form, avatarFile, updateProfile, refetch, dispatch]);

  return {
    form,
    isSaving,
    isUploading: false,
    avatar: avatarPreview,
    updateField,
    updateNameField,
    updatePhoneField,
    handleAvatarUpload,
    handleDeleteAvatar,
    handleSave,
  };
}
