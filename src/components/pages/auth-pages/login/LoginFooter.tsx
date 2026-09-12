import { Icon } from "@/components/ui/Icon";


export function LoginFooter() {
  return (
    <div className="flex px-4 sm:px-6 py-3 sm:py-4 justify-between items-center self-stretch border-t border-white/10">
      <div className="flex flex-col sm:flex-row justify-between items-center flex-1 gap-2 sm:gap-0">
        <span className="text-[#A5A5AB] font-inter text-xs sm:text-sm leading-[112%] text-center sm:text-left">
          Copyright © 2026 Bright Side Car Wash
        </span>
        <div className="flex items-center gap-3 sm:gap-6">
          <span className="text-[#A5A5AB] font-inter text-xs sm:text-sm leading-[112%] cursor-pointer hover:text-white transition-colors">
            <div className="flex gap-1">
                <Icon name="privacy" width={14} height={14} className="sm:w-4 sm:h-4" />
            Privacy
            </div>
          </span>
          <span className="text-[#A5A5AB] font-inter text-xs sm:text-sm leading-[112%] cursor-pointer hover:text-white transition-colors">
            <div className="flex gap-1">
                <Icon name="terms" width={14} height={14} className="sm:w-4 sm:h-4" />
            Terms
            </div>
          </span>
          <span className="text-[#A5A5AB] font-inter text-xs sm:text-sm leading-[112%] cursor-pointer hover:text-white transition-colors">
            <div className="flex gap-1">
                <Icon name="get-help" width={14} height={14} className="sm:w-4 sm:h-4" />
            Get Help
            </div>
          </span>
        </div>
      </div>
    </div>
  );
}