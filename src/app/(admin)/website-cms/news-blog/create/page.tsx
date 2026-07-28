'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { CreateNewsForm } from '@/components/pages/website-cms/news/CreateNewsForm';

export default function CreateNewsPage() {
    return (
        <div className="flex flex-col gap-6 w-full">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm">
                <Link
                    href="/website-cms/news-blog"
                    className="text-[#1B1B1B] font-inter leading-5 tracking-tight hover:text-[#0098E8] transition-colors"
                >
                    News & Blog
                </Link>
                <ChevronRight size={16} className="text-[#777980] rotate-90" />
                <span className="text-[#777980] font-inter leading-5 tracking-tight">
                    Add New Post
                </span>
            </div>

            {/* Form */}
            <CreateNewsForm />
        </div>
    );
}