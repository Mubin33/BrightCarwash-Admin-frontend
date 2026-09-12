"use client";

import { useState, useRef, useEffect } from "react";
import ReactCountryFlag from "react-country-flag";
import { ChevronDown } from "lucide-react";

const languages = [
  { code: "US", label: "EN" },
  { code: "BD", label: "BN" },
  { code: "ES", label: "ES" },
];

export function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(languages[0]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-white/20 bg-white/10 text-white text-xs sm:text-sm font-inter hover:bg-white/20 transition-colors"
      >
        <ReactCountryFlag countryCode={selected.code} svg style={{ width: 18, height: 13 }} className="sm:w-5 sm:h-[15px]" />
        <span className="hidden sm:inline">{selected.label}</span>
        <ChevronDown size={12} className={`sm:w-[14px] sm:h-[14px] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 bg-[#1B1F2D] border border-white/10 rounded-lg shadow-xl overflow-hidden z-50 min-w-[80px] sm:min-w-[100px]">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => { setSelected(lang); setOpen(false); }}
              className={`flex items-center gap-2 w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-white hover:bg-white/10 transition-colors ${selected.code === lang.code ? "bg-white/10" : ""}`}
            >
              <ReactCountryFlag countryCode={lang.code} svg style={{ width: 18, height: 13 }} className="sm:w-5 sm:h-[15px]" />
              <span className="hidden sm:inline">{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}