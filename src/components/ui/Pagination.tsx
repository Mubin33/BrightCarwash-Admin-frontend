"use client";

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  isLoading?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  isLoading = false,
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between gap-3 w-full pt-2">
      <div className="text-[#1B1B1B] font-inter text-sm font-normal leading-5">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="flex p-1.5 items-center rounded-md border border-[#DFE1E7] bg-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} className="text-[#A5A5AB]" />
        </Button>

        <div className="flex items-center gap-0.5 p-0.5 bg-[#F6F6F6] rounded-md">
          {getPageNumbers().map((page, index) =>
            typeof page === 'string' ? (
              <div
                key={`ellipsis-${index}`}
                className="w-6 h-6 flex items-center justify-center text-[#1B1B1B] font-inter text-sm font-medium"
              >
                {page}
              </div>
            ) : (
              <Button
                key={page}
                variant="icon"
                onClick={() => onPageChange(page)}
                disabled={isLoading}
                className={`w-6 h-6 flex items-center justify-center rounded-md text-sm font-inter font-medium transition-colors ${page === currentPage
                  ? 'bg-white text-[#1B1B1B] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.05)]'
                  : 'text-[#1B1B1B] hover:bg-white/50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {page}
              </Button>
            ),
          )}
        </div>

        <Button
          variant="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className="flex p-1.5 items-center rounded-md border border-[#DFE1E7] bg-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} className="text-[#1B1B1B]" />
        </Button>
      </div>
    </div>
  );
}