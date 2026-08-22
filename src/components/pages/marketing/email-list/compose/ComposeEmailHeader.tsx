"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Mail } from "lucide-react";

export function ComposeEmailHeader() {
    const router = useRouter();

    return (
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <Button
                    variant="icon"
                    onClick={() => router.push("/marketing/email-list")}
                    className="flex items-center text-[#777980] hover:text-[#1B1B1B] transition-colors p-0"
                >
                    <ChevronLeft size={20} />
                </Button>
                <div className="w-10 h-10 rounded-lg bg-[#EBF5FF] flex items-center justify-center">
                    <Mail width={20} height={20} color="#0098E8" />
                </div>
                <span className="text-[#1D1F2C] font-inter text-lg font-semibold">
                    Compose Email
                </span>
            </div>
            <Button
                variant="outline"
                onClick={() => router.push("/marketing/email-list")}
                className="flex py-2.5 px-4 items-center gap-2 rounded border border-[#DFE1E7] text-[#1B1B1B] font-inter text-sm w-auto!"
            >
                Back to List
            </Button>
        </div>
    );
}