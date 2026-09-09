import { createApi } from '@reduxjs/toolkit/query/react';
import type {
	PaymentStatsData,
	PaymentTransaction,
	PaymentStatsResponse,
	PaymentTransactionResponse,
} from '@/types/payment';
import { APP_CONFIG } from '@/configs/app.config';
import { mockStats, mockTransactions } from '@/mocks/payment.mock';
import axiosInstance from '@/lib/axios-instance';
import { getAccessToken } from '@/lib/auth-client';

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function transformTransaction(apiTx: PaymentTransactionResponse['data']['transactions'][0]): PaymentTransaction {
	return {
		id: apiTx.id,
		transactionId: apiTx.transaction_id,
		customerName: apiTx.customer_name,
		service: apiTx.service,
		amount: parseFloat(apiTx.amount) || 0,
		currency: apiTx.currency,
		status: apiTx.status as PaymentTransaction['status'],
		date: apiTx.created_at,
		leadId: apiTx.lead_id,
	};
}

export const paymentApi = createApi({
	reducerPath: 'paymentApi',
	baseQuery: async () => ({ data: null }),
	tagTypes: ['PaymentStats', 'PaymentTransactions'],
	endpoints: (builder) => ({
		getPaymentStats: builder.query<PaymentStatsData, void>({
			queryFn: async () => {
				try {
					if (APP_CONFIG.MOCK_MODE || APP_CONFIG.DASHBOARD_MOCK) {
						await delay(APP_CONFIG.MOCK_DELAY_MS);
						return { data: { ...mockStats } };
					}
					const { data } = await axiosInstance.get<PaymentStatsResponse>(
						'/payment-transaction/stats'
					);
					return { data: data.data };
				} catch (error) {
					return {
						error: {
							status: 500,
							data: error instanceof Error ? error.message : 'Failed to fetch payment stats',
						},
					};
				}
			},
			providesTags: ['PaymentStats'],
		}),

		getPaymentTransactions: builder.query<
			{ transactions: PaymentTransaction[]; meta: PaymentTransactionResponse['data']['meta'] },
			{ page?: number; limit?: number; search?: string; status?: string }
		>({
			queryFn: async (params) => {
				try {
					const queryParams = new URLSearchParams();
					if (params.page) queryParams.append('page', String(params.page));
					if (params.limit) queryParams.append('limit', String(params.limit));
					if (params.search) queryParams.append('search', params.search);
					if (params.status) queryParams.append('status', params.status);

					const url = `/payment-transaction?${queryParams.toString()}`;

					if (APP_CONFIG.MOCK_MODE || APP_CONFIG.DASHBOARD_MOCK) {
						await delay(APP_CONFIG.MOCK_DELAY_MS);
						// Simple mock filtering
						let filtered = [...mockTransactions];
						if (params.search) {
							const q = params.search.toLowerCase();
							filtered = filtered.filter(
								(tx) =>
									tx.customerName.toLowerCase().includes(q) ||
									tx.service.toLowerCase().includes(q) ||
									tx.transactionId.toLowerCase().includes(q)
							);
						}
						if (params.status) {
							filtered = filtered.filter((tx) => tx.status === params.status);
						}
						const page = params.page || 1;
						const limit = params.limit || 10;
						const start = (page - 1) * limit;
						const paginated = filtered.slice(start, start + limit);
						return {
							data: {
								transactions: paginated,
								meta: {
									totalItems: filtered.length,
									itemCount: paginated.length,
									itemsPerPage: limit,
									totalPages: Math.ceil(filtered.length / limit),
									currentPage: page,
									hasNextPage: page * limit < filtered.length,
									hasPreviousPage: page > 1,
								},
							},
						};
					}

					const { data } = await axiosInstance.get<PaymentTransactionResponse>(url);
					return {
						data: {
							transactions: data.data.transactions.map(transformTransaction),
							meta: data.data.meta,
						},
					};
				} catch (error) {
					return {
						error: {
							status: 500,
							data: error instanceof Error ? error.message : 'Failed to fetch payment transactions',
						},
					};
				}
			},
			providesTags: ['PaymentTransactions'],
		}),
	}),
});

export const { useGetPaymentStatsQuery, useGetPaymentTransactionsQuery } = paymentApi;