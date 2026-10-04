import Link from 'next/link';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFB] px-4 py-12">
      <div className="w-full max-w-md bg-white border border-[#DFE1E7] rounded-2xl p-8 text-center shadow-sm">
        <div className="w-16 h-16 rounded-full bg-[#EBF5FF] text-[#0098E8] flex items-center justify-center mx-auto mb-5">
          <FileQuestion size={32} />
        </div>
        <span className="inline-block text-xs font-semibold tracking-wider text-[#0098E8] uppercase mb-2">
          404 Error
        </span>
        <h1 className="text-2xl font-bold text-[#1B1B1B] mb-2 font-inter">
          Page Not Found
        </h1>
        <p className="text-sm text-[#777980] mb-6 font-inter leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#0098E8] text-white font-medium text-sm hover:bg-[#0088D8] transition-colors shadow-sm"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
