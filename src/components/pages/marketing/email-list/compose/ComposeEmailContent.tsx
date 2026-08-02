'use client';

import { Suspense } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ComposeEmailHeader } from "./ComposeEmailHeader";
import { ComposeEmailForm } from "./ComposeEmailForm";
import { ComposeEmailEditor } from "./ComposeEmailEditor";
import { useComposeEmail } from "@/hooks/useComposeEmail";
import { Send } from "lucide-react";

function ComposeEmailFormWrapper() {
    const {
        form,
        isSending,
        updateField,
        addFiles,
        removeFile,
        toggleCcBcc,
        handleSend,
    } = useComposeEmail();

    return (
        <div className="p-6 rounded-xl border border-[#DFE1E7] bg-white flex flex-col gap-6">
            <ComposeEmailForm
                form={form}
                updateField={updateField}
                addFiles={addFiles}
                removeFile={removeFile}
                toggleCcBcc={toggleCcBcc}
            />

            <ComposeEmailEditor
                value={form.body}
                onChange={(html) => updateField("body", html)}
            />

            <div>
                <Button
                    onClick={handleSend}
                    isLoading={isSending}
                    loadingText="Sending..."
                    className="w-auto! flex py-2.5 items-center gap-2 rounded bg-[#0098E8] text-white font-inter text-sm hover:bg-[#0088D8] transition-colors"
                >
                    <Send width={16} height={16} color="white" />
                    Send Email
                </Button>
            </div>
        </div>
    );
}

export function ComposeEmailContent() {
    return (
        <div className="flex flex-col gap-6 w-full">
            <ComposeEmailHeader />
            <Suspense fallback={<div className="h-96 bg-gray-100 rounded-lg animate-pulse" />}>
                <ComposeEmailFormWrapper />
            </Suspense>
        </div>
    );
}