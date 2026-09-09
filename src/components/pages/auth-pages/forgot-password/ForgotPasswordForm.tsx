"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { forgotPassword } from "@/services/auth.service";
import { Button } from "@/components/ui/Button";
import { toast } from "react-toastify";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await forgotPassword({ email });
      toast.success(response.message);
      sessionStorage.setItem("resetEmail", email);
      router.push("/verify-otp");
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Something went wrong";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[#E9E9EA] mb-2">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your email"
          className="w-full px-4 py-4 bg-white/[0.12] border border-white/20 rounded-lg text-white placeholder-[#777980] font-inter text-sm outline-none focus:border-[#0098E8] focus:ring-1 focus:ring-[#0098E8] transition-all"
        />
      </div>

      <Button
        type="submit"
        isLoading={isSubmitting}
        loadingText="Sending OTP..."
        className="w-full py-4 px-5 justify-center items-center gap-2 rounded-xl bg-[#0098E8] text-white font-inter text-base font-medium hover:bg-[#0088D8] transition-all"
      >
        Send OTP
      </Button>

      <p className="text-center">
        <a href="/login" className="text-[#E9E9EA] font-inter text-sm hover:text-white transition-colors">
          Back to login
        </a>
      </p>
    </form>
  );
}