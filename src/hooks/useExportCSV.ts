'use client';

import { useCallback } from 'react';
import { getAccessToken } from '@/lib/auth-client';
import { APP_CONFIG } from '@/configs/app.config';

export function useExportCSV() {
    const exportCSV = useCallback(
        async (search?: string, status?: string) => {
            const token = getAccessToken();
            if (!token) throw new Error('Not authenticated');

            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (status) params.set('status', status);

            const url = `${APP_CONFIG.API_BASE_URL}/payment-transaction/export/csv?${params.toString()}`;

            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('CSV export failed');

            const blob = await response.blob();
            const contentDisp = response.headers.get('Content-Disposition');
            let filename = 'payments-export.csv';
            if (contentDisp) {
                const match = contentDisp.match(/filename="?(.+?)"?$/);
                if (match) filename = match[1];
            }

            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);
        },
        []
    );

    return { exportCSV };
}