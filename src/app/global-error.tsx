'use client';

import { useEffect } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Fatal Root Application Error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-[#F8FAFB] px-4 py-12 font-sans m-0">
        <div className="w-full max-w-md bg-white border border-[#DFE1E7] rounded-2xl p-8 text-center shadow-md">
          <div className="w-16 h-16 rounded-full bg-[#FEE4E2] text-[#B23730] flex items-center justify-center mx-auto mb-5">
            <AlertOctagon size={32} />
          </div>
          <h1 className="text-2xl font-bold text-[#1B1B1B] mb-2">
            Critical Application Error
          </h1>
          <p className="text-sm text-[#777980] mb-6 leading-relaxed">
            A critical error interrupted the application shell. Please reload the application to restore functionality.
          </p>
          {error.digest && (
            <p className="text-xs text-[#777980] bg-gray-50 border border-gray-200 rounded-md py-1.5 px-3 mb-6 font-mono inline-block">
              Error Ref: {error.digest}
            </p>
          )}
          <button
            onClick={() => reset()}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#0098E8] text-white font-medium text-sm hover:bg-[#0088D8] transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw size={16} />
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
