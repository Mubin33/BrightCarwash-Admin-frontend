import Image from "next/image";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { LoginForm } from "@/components/pages/auth-pages/login/LoginForm";
import { LoginFooter } from "@/components/pages/auth-pages/login/LoginFooter";

export function LoginLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left panel */}
      <div className="flex w-full max-w-[650px] flex-col items-start self-stretch bg-[#0B1220] overflow-y-auto">
        {/* Header */}
        <div className="flex px-8 py-4 justify-between items-center self-stretch">
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={57}
            height={64}
            className="object-contain"
          />
          <LanguageSelector />
        </div>

        {/* Main content */}
        <div className="flex px-10 py-20 flex-col justify-center items-center gap-8 flex-1 self-stretch">
          <div className="flex flex-col gap-2 self-stretch">
            <h1 className="text-white font-inter text-[32px] font-semibold leading-[130%]">
              Hi, welcome back again!
            </h1>
            <p className="text-[#E9E9EA] font-inter text-sm font-normal leading-[160%]">
              Login with your email and password that you have been created before, or you can create account if you don`t have Asanah account.
            </p>
          </div>
          <LoginForm />
        </div>

        {/* Footer */}
        <LoginFooter />
      </div>

      {/* Right panel – image with border frame */}
      <div className="flex-1 relative hidden lg:block bg-white border-t-[50px] border-l-[50px] border-white">
        <div className="relative w-full h-full overflow-hidden rounded-tl-[20px] ">
          <Image
            src="/images/dashboard.png"
            alt="Dashboard preview"
            fill
            className="object-cover"
            priority
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#e3e4e6]/90 via-[#0B1220]/40 to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#0B1220]/30 to-transparent" />
        </div>
      </div>
    </div>
  );
}