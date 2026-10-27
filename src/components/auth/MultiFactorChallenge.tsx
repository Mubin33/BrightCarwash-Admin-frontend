"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export interface MultiFactorChallengeProps {
  challengeToken: string;
  email?: string;
  method?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MultiFactorChallenge({
  challengeToken,
  email,
  method = "totp",
  onSuccess,
  onCancel,
}: MultiFactorChallengeProps) {
  const { verifyMfa, cancelMfa } = useAuth();
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();
    setError(null);

    const cleanCode = code.trim().replace(/\D/g, "");
    if (!/^\d{6}$/.test(cleanCode)) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setIsSubmitting(true);
    try {
      // Invariant AU15: Code is never stored in localStorage, sessionStorage, or URL
      await verifyMfa(challengeToken, cleanCode);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      // Refusals are shown and allow retry (invalid, expired, reused, or mismatched challenge)
      const errorMsg =
        err instanceof Error ? err.message : "Verification failed. Please check your code.";
      setError(errorMsg);
      // Clear code input to allow clean retry
      setCode("");
      inputRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    // Invariant AU15: Cancel returns to sign-in with no session or token kept
    cancelMfa();
    setCode("");
    setError(null);
    if (onCancel) {
      onCancel();
    }
  }

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex flex-col items-center text-center gap-2">
        <div className="w-12 h-12 rounded-full bg-[#0098E8]/15 border border-[#0098E8]/40 flex items-center justify-center text-[#0098E8] mb-1">
          <ShieldCheck size={26} />
        </div>
        <h2 className="text-white font-inter text-xl font-semibold">
          Two-Factor Authentication
        </h2>
        <p className="text-[#777980] font-inter text-xs sm:text-sm max-w-xs">
          Enter the 6-digit security code from your authenticator app
          {email ? ` for ${email}` : ""} to complete sign in.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="w-full p-3 bg-[#FF4345]/20 border border-[#FF4345] rounded-lg text-[#FF4345] font-inter text-sm text-center"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full" noValidate>
        <div>
          <label
            htmlFor="mfa-code-input"
            className="block text-xs sm:text-sm font-medium text-[#E9E9EA] mb-1.5"
          >
            Authentication Code
          </label>
          <input
            id="mfa-code-input"
            ref={inputRef}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 6);
              setCode(val);
              if (error) setError(null);
            }}
            placeholder="000000"
            disabled={isSubmitting}
            className="w-full px-4 py-3 sm:py-3.5 bg-white/[0.12] border border-white/20 rounded-lg text-white text-center tracking-[0.5em] text-xl font-mono placeholder-[#777980] outline-none focus:border-[#0098E8] focus:ring-1 focus:ring-[#0098E8] transition-all disabled:opacity-50"
          />
        </div>

        <Button
          type="submit"
          isLoading={isSubmitting}
          loadingText="Verifying..."
          disabled={isSubmitting || code.length !== 6}
          className="w-full py-3 sm:py-4 px-4 justify-center items-center rounded-xl bg-[#0098E8] text-white font-inter text-sm sm:text-base font-medium hover:bg-[#0088D8] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Verify Code
        </Button>

        <button
          type="button"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 text-[#777980] hover:text-[#E9E9EA] font-inter text-sm font-medium transition-colors py-2 disabled:opacity-50 cursor-pointer"
        >
          <ArrowLeft size={16} />
          Cancel and return to sign in
        </button>
      </form>
    </div>
  );
}
