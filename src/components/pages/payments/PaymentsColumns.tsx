import { formatCurrency } from '@/lib/payment-utils';
import type { Column } from '@/components/ui/DataTable';
import type { PaymentTransaction } from '@/types/payment';

const statusStyles: Record<string, string> = {
	PAID: 'text-[#006F1F] border-[#E8E8E9] bg-white',
	FAILED: 'text-[#FF4345] border-[#E8E8E9] bg-white',
};

function getInitials(name: string): string {
	return name
		.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2);
}

export const paymentsColumns: Column<PaymentTransaction>[] = [
	{
		key: 'customerName',
		header: 'Customer Name',
		render: (row) => (
			<div className="flex items-center gap-2">
				<div className="w-6 h-6 rounded-full bg-[#E8E8E9] flex items-center justify-center text-[10px] font-medium text-[#777980]">
					{getInitials(row.customerName)}
				</div>
				<span className="text-[#1B1B1B] font-inter text-sm truncate max-w-30">
					{row.customerName}
				</span>
			</div>
		),
	},
	{
		key: 'service',
		header: 'Service',
		render: (row) => (
			<span className="text-[#1B1B1B] font-inter text-sm truncate max-w-150! block" title={row.service}>
				{row.service}
			</span>
		),
	},
	{
		key: 'transactionId',
		header: 'Transaction ID',
		render: (row) => (
			<span className="text-[#1B1B1B] font-inter text-sm font-mono">
				{row.transactionId}
			</span>
		),
	},
	{
		key: 'amount',
		header: 'Amount',
		render: (row) => (
			<span className="text-[#1B1B1B] font-inter text-sm font-medium">
				{formatCurrency(row.amount, row.currency)}
			</span>
		),
	},
	{
		key: 'status',
		header: 'Status',
		render: (row) => (
			<span
				className={`inline-flex py-1.5 px-2 justify-center items-center gap-1 rounded border text-sm capitalize ${statusStyles[row.status] || 'text-[#777980] border-[#E8E8E9] bg-white'
					}`}
			>
				{row.status}
			</span>
		),
	},
	{
		key: 'date',
		header: 'Date',
		render: (row) => (
			<span className="text-[#1B1B1B] font-inter text-sm">
				{new Date(row.date).toLocaleDateString('en-US', {
					month: 'short',
					day: 'numeric',
					year: 'numeric',
				})}
			</span>
		),
	},
];