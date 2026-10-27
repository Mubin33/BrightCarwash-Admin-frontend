"use client";

import { SettingsTabs } from "./SettingsTabs";
import { ProfileSettings } from "./ProfileSettings";
import { BusinessSettings } from "./BusinessSettings";
import { SecuritySettings } from "./SecuritySettings";
import type { SettingsTab } from "@/types/settings";
import BusinessHours from "../website-cms/BusinessHours/BusinessHours";

interface SettingsContentProps {
    profile?: boolean;
    business?: boolean;
    security?: boolean;
    businessHours?: boolean;
}

export function SettingsContent({ profile, business, security, businessHours }: SettingsContentProps) {
    const tab: SettingsTab = profile
        ? "profile"
        : security
        ? "security"
        : businessHours
        ? "business-hours"
        : "profile";

    return (
        <div className="flex flex-col gap-6 w-full p-4">
            <SettingsTabs />
            {tab === "profile" && <ProfileSettings />}
            {/* {tab === "business" && <BusinessSettings />} */}
            {tab === "security" && <SecuritySettings />}
            {tab === "business-hours" && <BusinessHours />}
        </div>
    );
}