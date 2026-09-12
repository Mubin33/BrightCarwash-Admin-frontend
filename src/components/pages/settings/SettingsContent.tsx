"use client";

import { SettingsTabs } from "./SettingsTabs";
import { ProfileSettings } from "./ProfileSettings";
import { BusinessSettings } from "./BusinessSettings";
import { SecuritySettings } from "./SecuritySettings";
import type { SettingsTab } from "@/types/settings";

interface SettingsContentProps {
    profile?: boolean;
    business?: boolean;
    security?: boolean;
}

export function SettingsContent({ profile, business, security }: SettingsContentProps) {
    const tab: SettingsTab = profile ? "profile" : business ? "business" : "security";

    return (
        <div className="flex flex-col gap-6 w-full p-4">
            <SettingsTabs />
            {tab === "profile" && <ProfileSettings />}
            {tab === "business" && <BusinessSettings />}
            {tab === "security" && <SecuritySettings />}
        </div>
    );
}