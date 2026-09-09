"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "react-toastify";
import { useChangePasswordMutation } from "@/services/settings.api";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";

const labelClass = "text-[#777980] font-inter text-base font-normal leading-5";
const inputClass = "w-full px-4 py-3 pr-11 bg-white rounded-lg border border-[#DFE1E7] text-[#1B1B1B] font-inter text-base outline-none focus:border-[#0098E8] transition-all";
const errorClass = "text-[#FF4345] font-inter text-sm";

interface FormState {
    old_password: string;
    new_password: string;
    confirm_password: string;
}

interface FormErrors {
    old_password?: string;
    new_password?: string;
    confirm_password?: string;
}

export function SecuritySettings() {
    const [form, setForm] = useState<FormState>({
        old_password: "",
        new_password: "",
        confirm_password: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [changePassword, { isLoading: isSaving }] = useChangePasswordMutation();

    const updateField = (key: keyof FormState, value: string) => {
        setForm((p) => ({ ...p, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

    const validate = (): boolean => {
        const newErrors: FormErrors = {};

        if (!form.old_password) {
            newErrors.old_password = "Current password is required";
        }

        if (!form.new_password) {
            newErrors.new_password = "New password is required";
        } else if (form.new_password.length < 8) {
            newErrors.new_password = "Password must be at least 8 characters";
        }

        if (!form.confirm_password) {
            newErrors.confirm_password = "Please confirm your new password";
        } else if (form.new_password && form.confirm_password !== form.new_password) {
            newErrors.confirm_password = "Passwords do not match";
        }

        if (form.old_password && form.new_password && form.old_password === form.new_password) {
            newErrors.new_password = "New password must be different from current password";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) {
            toast.warning("Please fix the errors below");
            return;
        }

        try {
            await changePassword({
                old_password: form.old_password,
                new_password: form.new_password,
            }).unwrap();

            toast.success("Password changed successfully");
            setForm({ old_password: "", new_password: "", confirm_password: "" });
            setErrors({});
        } catch (err: any) {
            const message = err?.data?.message || "Failed to change password";
            toast.error(message);

            // If backend says old password is wrong, surface it inline too
            if (typeof message === "string" && message.toLowerCase().includes("current")) {
                setErrors((prev) => ({ ...prev, old_password: message }));
            }
        }
    };

    const PasswordField = ({
        label,
        value,
        onChange,
        show,
        setShow,
        error,
        placeholder,
    }: {
        label: string;
        value: string;
        onChange: (v: string) => void;
        show: boolean;
        setShow: (v: boolean) => void;
        error?: string;
        placeholder: string;
    }) => (
        <div className="flex flex-col gap-2">
            <label className={labelClass}>{label}</label>
            <div className="relative">
                <input
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`${inputClass} ${error ? "border-[#FF4345]" : ""}`}
                />
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777980] hover:text-[#1B1B1B] transition-colors"
                    tabIndex={-1}
                >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
            {error && <span className={errorClass}>{error}</span>}
        </div>
    );

    return (
        <div className="p-6 bg-[#F8FAFB] rounded-lg border border-[#DFE1E7] flex flex-col gap-6">
            <div className="flex flex-col gap-4 max-w-md">
                <PasswordField
                    label="Current Password"
                    value={form.old_password}
                    onChange={(v) => updateField("old_password", v)}
                    show={showOld}
                    setShow={setShowOld}
                    error={errors.old_password}
                    placeholder="Enter current password"
                />
                <PasswordField
                    label="New Password"
                    value={form.new_password}
                    onChange={(v) => updateField("new_password", v)}
                    show={showNew}
                    setShow={setShowNew}
                    error={errors.new_password}
                    placeholder="Enter new password"
                />
                <PasswordField
                    label="Confirm New Password"
                    value={form.confirm_password}
                    onChange={(v) => updateField("confirm_password", v)}
                    show={showConfirm}
                    setShow={setShowConfirm}
                    error={errors.confirm_password}
                    placeholder="Re-enter new password"
                />
            </div>
            <div>
                <Button
                    onClick={handleSave}
                    isLoading={isSaving}
                    loadingText="Saving..."
                    permission={PERMISSIONS.user.update}
                    className="flex py-2.5 px-4 items-center gap-2 rounded bg-[#0098E8] text-white font-inter text-sm hover:bg-[#0088D8] transition-colors w-auto!"
                >
                    Save Changes
                </Button>
            </div>
        </div>
    );
}