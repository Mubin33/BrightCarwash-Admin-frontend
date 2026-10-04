'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Unhandled App Router Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFB] px-4 py-12">
      <div className="w-full max-w-md bg-white border border-[#DFE1E7] rounded-2xl p-8 text-center shadow-sm">
        <div className="w-16 h-16 rounded-full bg-[#FEE4E2] text-[#B23730] flex items-center justify-center mx-auto mb-5">
          <AlertTriangle size={32} />
        </div>
        <span className="inline-block text-xs font-semibold tracking-wider text-[#B23730] uppercase mb-2">
          Application Error
        </span>
        <h1 className="text-2xl font-bold text-[#1B1B1B] mb-2 font-inter">
          Something went wrong
        </h1>
        <p className="text-sm text-[#777980] mb-4 font-inter leading-relaxed">
          An unexpected error occurred while rendering this page. You can try refreshing the view or return to the dashboard.
        </p>
        {error.digest && (
          <p className="text-xs text-[#777980] bg-gray-50 border border-gray-200 rounded-md py-1.5 px-3 mb-6 font-mono inline-block">
            Digest: {error.digest}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#0098E8] text-white font-medium text-sm hover:bg-[#0088D8] transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-[#DFE1E7] bg-white text-[#1B1B1B] font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            <Home size={16} />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
