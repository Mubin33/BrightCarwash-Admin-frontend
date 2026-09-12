import SetPasswordLayout from "@/components/layouts/SetPasswordLayout";
import { Suspense } from "react";

export default function SetPasswordPage() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center text-white">Loading...</div>}>
            <SetPasswordLayout />
        </Suspense>
    );
}