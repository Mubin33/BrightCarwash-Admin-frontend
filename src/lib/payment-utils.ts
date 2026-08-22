import type { PaymentStatsData, PaymentStatsResponse, PaymentTransaction } from '@/types/payment';
import type { MetricCard } from '@/types/dashboard';


export function centsToDollars(cents: number): string {
    return (cents / 100).toFixed(2);
}


export function formatCurrency(amount: number, currency: string = 'USD'): string {
    const dollars = amount/100;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(dollars);
}


export function formatTransactionAmount(amount: number, currency: string = 'USD'): string {
    return formatCurrency(amount, currency);
}


export function mapStatsToMetrics(statsData: PaymentStatsData): MetricCard[] {
    return [
        {
            id: 'total-revenue',
            heading: 'Total Revenue',
            value: formatCurrency(statsData.totalRevenue.value || 0),
            changePercent: statsData.totalRevenue.percentage,
            changeDirection: statsData.totalRevenue.status === 'up' ? 'up' : 'down',
            vsLabel: 'vs last period',
        },
        {
            id: 'paid-deposits',
            heading: 'Paid Deposits',
            value: String(statsData.paidDeposits.value || 0),
            changePercent: statsData.paidDeposits.percentage,
            changeDirection: statsData.paidDeposits.status === 'up' ? 'up' : 'down',
            vsLabel: 'vs last period',
        },
        {
            id: 'pending',
            heading: 'Pending',
            value: String(statsData.pending.value || 0),
            changePercent: statsData.pending.percentage,
            changeDirection: statsData.pending.status === 'up' ? 'up' : 'down',
            vsLabel: 'vs last period',
        },
        {
            id: 'failed',
            heading: 'Failed',
            value: String(statsData.failed.value || 0),
            changePercent: statsData.failed.percentage,
            changeDirection: statsData.failed.status === 'up' ? 'up' : 'down',
            vsLabel: 'vs last period',
        },
    ];
}

export const PAYMENT_EXPORT_COLUMNS = [
    { key: 'id', header: 'Transaction ID' },
    { key: 'amount', header: 'Amount' },
    { key: 'status', header: 'Status' },
    { key: 'method', header: 'Payment Method' },
    { key: 'customerName', header: 'Customer Name' },
    { key: 'date', header: 'Date' },
];
