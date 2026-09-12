'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';

export function usePaymentPageState() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const page = parseInt(searchParams.get('page') || '1', 10);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const setParams = useCallback(
        (updates: { page?: number; search?: string; status?: string }) => {
            const params = new URLSearchParams(searchParams.toString());
            if (updates.page !== undefined) params.set('page', String(updates.page));
            else params.delete('page');
            if (updates.search !== undefined) {
                if (updates.search) params.set('search', updates.search);
                else params.delete('search');
            }
            if (updates.status !== undefined) {
                if (updates.status) params.set('status', updates.status);
                else params.delete('status');
            }
            if (updates.search !== undefined || updates.status !== undefined) {
                params.set('page', '1');
            }
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
        },
        [router, pathname, searchParams]
    );

    return {
        page,
        search,
        status,
        setPage: (p: number) => setParams({ page: p }),
        setSearch: (s: string) => setParams({ search: s }),
        setStatus: (s: string) => setParams({ status: s }),
    };
}