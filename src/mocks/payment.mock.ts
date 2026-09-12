import type { PaymentStatsData, PaymentTransaction } from '@/types/payment';

export const mockStats: PaymentStatsData = {
	totalRevenue: { value: 1500, percentage: '+100%', status: 'up' },
	paidDeposits: { value: 1, percentage: '+100%', status: 'up' },
	pending: { value: 0, percentage: '0%', status: 'up' },
	failed: { value: 2, percentage: '+100%', status: 'up' },
};

export const mockTransactions: PaymentTransaction[] = [
	{
		id: 'cmqxo8tcn0002hstmw9iro0em',
		transactionId: 'H3wPo73NbO0Chb7jzySECD7qifVZY',
		customerName: 'Test 002',
		service: 'Express Detail Interior - Sedan/ SUV (Regular Session) - (60 min)',
		amount: 500,
		currency: 'USD',
		status: 'PAID',
		date: '2026-06-28T10:54:16.727Z',
		leadId: 'cmqxo54sp0001ictm5g2pntxd',
	},
	{
		id: 'cmqxo87ca0000hstmpgociruj',
		transactionId: 'TXN-FAIL-B675CC4F',
		customerName: 'Test 002',
		service: 'Express Detail Interior - Sedan/ SUV (Regular Session) - (60 min)',
		amount: 500,
		currency: 'USD',
		status: 'FAILED',
		date: '2026-06-28T10:53:48.202Z',
		leadId: 'cmqxo54sp0001ictm5g2pntxd',
	},
	{
		id: 'cmqxo56ay0003ictm55belio7',
		transactionId: 'TXN-FAIL-83455B27',
		customerName: 'Test 002',
		service: 'Express Detail Interior - Sedan/ SUV (Regular Session) - (60 min)',
		amount: 500,
		currency: 'USD',
		status: 'FAILED',
		date: '2026-06-28T10:51:26.890Z',
		leadId: 'cmqxo54sp0001ictm5g2pntxd',
	},
];