"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { useProfileSettings } from "@/hooks/useProfileSettings";
import { useGetProfileQuery } from "@/services/settings.api";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";
import { useSelector } from "react-redux";

const labelClass = "text-[#777980] font-inter text-base font-normal leading-5";
const inputClass = "w-full px-4 py-3 bg-white rounded-lg border border-[#DFE1E7] text-[#1B1B1B] font-inter text-base outline-none focus:border-[#0098E8] transition-all";

export function ProfileSettings() {
    const { data: initialData, isLoading } = useGetProfileQuery();
    const user = useSelector((state: { auth: { user: { permissions: string[] } | null } }) => state.auth.user);
    const canViewProfile = hasPermission(user, PERMISSIONS.user.read);
    const {
        form,
        avatar,
        isUploading,
        isSaving,
        updateNameField,
        updatePhoneField,
        handleAvatarUpload,
        handleDeleteAvatar,
        handleSave,
    } = useProfileSettings(initialData || {
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        avatar: null,
    });

    if (isLoading) {
        return <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />;
    }

    if (!canViewProfile) return null;

    return (
        <div className="p-6 bg-[#F8FAFB] rounded-lg border border-[#DFE1E7] flex flex-col gap-6">
            <div className="flex flex-col gap-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-[#DFE1E7] relative">
                        {avatar ? (
                            <Image src={avatar} alt="Avatar" fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#777980] text-lg font-medium">
                                {form.first_name?.charAt(0) || "A"}
                            </div>
                        )}
                    </div>
                    <label className="flex py-2.5 px-4 rounded-lg border border-[#DFE1E7] text-[#1B1B1B] font-inter text-sm cursor-pointer hover:bg-[#F1F1F1] transition-colors">
                        {isUploading ? "Uploading..." : "Upload Photo"}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])}
                            className="hidden"
                        />
                    </label>
                    <Button
                        variant="outline"
                        onClick={handleDeleteAvatar}
                        className="py-2.5 px-4 rounded-lg border border-[#DFE1E7] text-[#FF4345] font-inter text-sm hover:bg-[#FFE6E6] transition-colors w-auto!"
                    >
                        Delete Photo
                    </Button>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex gap-4">
                        <div className="flex-1 flex flex-col gap-2">
                            <label className={labelClass}>First name</label>
                            <input
                                type="text"
                                value={form.first_name}
                                onChange={(e) => updateNameField("first_name", e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <div className="flex-1 flex flex-col gap-2">
                            <label className={labelClass}>Last name</label>
                            <input
                                type="text"
                                value={form.last_name}
                                onChange={(e) => updateNameField("last_name", e.target.value)}
                                className={inputClass}
                            />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1 flex flex-col gap-2">
                            <label className={labelClass}>Email Address</label>
                            <input
                                type="email"
                                value={form.email}
                                disabled
                                className={`${inputClass} bg-[#F1F1F1] text-[#777980] cursor-not-allowed`}
                            />
                        </div>
                        <div className="flex-1 flex flex-col gap-2">
                            <label className={labelClass}>Phone Number</label>
                            <div className="flex items-center w-full rounded-lg border border-[#DFE1E7] bg-white focus-within:border-[#0098E8] transition-all">
                                <span className="px-4 py-3 text-[#1B1B1B] font-inter text-base border-r border-[#DFE1E7] select-none">
                                    +1
                                </span>
                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    value={form.phone}
                                    onChange={(e) => updatePhoneField(e.target.value)}
                                    placeholder="(555) 123-4567"
                                    className="w-full px-4 py-3 text-[#1B1B1B] font-inter text-base outline-none bg-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <Button
                    onClick={handleSave}
                    isLoading={isSaving}
                    loadingText="Saving..."
                    permission={PERMISSIONS.user.update}
                    className="w-auto! flex py-2.5 px-4 items-center gap-2 rounded bg-[#0098E8] text-white font-inter text-sm hover:bg-[#0088D8] transition-colors w-auto!"
                >
                    Save Changes
                </Button>
            </div>
        </div>
    );
}