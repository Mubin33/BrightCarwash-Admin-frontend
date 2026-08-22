"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SettingsTab } from "@/types/settings";

const TABS: { key: SettingsTab; label: string; href: string }[] = [
    { key: "profile", label: "Profile Setting", href: "/settings" },
    { key: "business", label: "Business Profile", href: "/settings/business" },
    { key: "security", label: "Security Setting", href: "/settings/security" },
];

export function SettingsTabs() {
    const pathname = usePathname();

    return (
        <div className="flex p-1 items-center gap-0.5 rounded-lg border border-[#DFE1E7] bg-[#F6F6F6] w-fit">
            {TABS.map((tab) => {
                const isActive = tab.key === "profile" ? pathname === "/settings" : pathname.startsWith(tab.href);
                return (
                    <Link
                        key={tab.key}
                        href={tab.href}
                        className={`flex py-2 px-3 justify-center items-center gap-1 rounded-md text-sm font-inter transition-colors ${isActive
                                ? "bg-white text-[#1B1B1B] font-medium shadow-[0px_4px_4px_0px_rgba(0,0,0,0.05)]"
                                : "text-[#777980] font-normal hover:text-[#1B1B1B]"
                            }`}
                    >
                        {tab.label}
                    </Link>
                );
            })}
        </div>
    );
}