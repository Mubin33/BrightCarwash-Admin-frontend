import { createApi } from '@reduxjs/toolkit/query/react';
import type {
	Campaign,
	CreateCampaignRequest,
	UpdateCampaignRequest,
	CampaignListResponse,
	CampaignResponse,
} from '@/types/campaign';
import { APP_CONFIG } from '@/configs/app.config';
import { mockCampaigns } from '@/mocks/campaign.mock';
import axiosInstance from '@/lib/axios-instance';
import { getAccessToken } from '@/lib/auth-client';

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// Transform API response to match Campaign type
function transformCampaign(apiCampaign: any): Campaign {
	return {
		id: apiCampaign.id,
		name: apiCampaign.name,
		tags: apiCampaign.tags || [],
		status: apiCampaign.status || 'DRAFT',
		channelType: apiCampaign.channelType || 'EMAIL',
		scheduledAt: apiCampaign.scheduledAt || null,
		emailConfig: {
			subject: apiCampaign.emailConfig?.subject || '',
			senderName: apiCampaign.emailConfig?.senderName || '',
			senderEmail: apiCampaign.emailConfig?.senderEmail || '',
			leadGroup: {
				name: apiCampaign.emailConfig?.leadGroup?.name || '',
			},
			// ✅ CRITICAL: Map these fields from the API response
			leadGroupId: apiCampaign.emailConfig?.leadGroupId || null,
			templateId: apiCampaign.emailConfig?.templateId || null,
			htmlContent: apiCampaign.emailConfig?.htmlContent || '',
		},
		analytics: {
			PENDING: apiCampaign.analytics?.PENDING || 0,
			SENT: apiCampaign.analytics?.SENT || 0,
			DELIVERED: apiCampaign.analytics?.DELIVERED || 0,
			OPENED: apiCampaign.analytics?.OPENED || 0,
			CLICKED: apiCampaign.analytics?.CLICKED || 0,
			BOUNCED: apiCampaign.analytics?.BOUNCED || 0,
			FAILED: apiCampaign.analytics?.FAILED || 0,
		},
		createdAt: apiCampaign.createdAt || new Date().toISOString(),
		updatedAt: apiCampaign.updatedAt || new Date().toISOString(),
	};
}

export const campaignApi = createApi({
	reducerPath: 'campaignApi',
	baseQuery: async () => ({ data: null }),
	tagTypes: ['Campaigns', 'Campaign'],
	endpoints: (builder) => ({
		// GET all campaigns
		getCampaigns: builder.query<Campaign[], void>({
			queryFn: async () => {
				try {
					if (APP_CONFIG.MOCK_MODE) {
						await delay(APP_CONFIG.MOCK_DELAY_MS);
						return { data: mockCampaigns.map(transformCampaign) };
					}
					const { data } = await axiosInstance.get<CampaignListResponse>(
						'/admin/campaigns/campaigns'
					);
					return { data: data.data.campaigns.map(transformCampaign) };
				} catch (error) {
					return {
						error: {
							status: 500,
							data:
								error instanceof Error
									? error.message
									: 'Failed to fetch campaigns',
						},
					};
				}
			},
			providesTags: ['Campaigns'],
			keepUnusedDataFor: 60,
		}),

		// GET single campaign
		getCampaignById: builder.query<Campaign, string>({
			queryFn: async (id) => {
				try {
					if (APP_CONFIG.MOCK_MODE) {
						await delay(APP_CONFIG.MOCK_DELAY_MS);
						const mock = mockCampaigns.find((c) => c.id === id);
						if (!mock) throw new Error('Campaign not found');
						return { data: transformCampaign(mock) };
					}
					const { data } = await axiosInstance.get<CampaignResponse>(
						`/admin/campaigns/campaigns/${id}`
					);
					return { data: transformCampaign(data.data) };
				} catch (error) {
					return {
						error: {
							status: 500,
							data:
								error instanceof Error
									? error.message
									: 'Failed to fetch campaign',
						},
					};
				}
			},
			providesTags: (_result, _error, id) => [{ type: 'Campaign', id }],
			keepUnusedDataFor: 300,
		}),

		// CREATE campaign
		createCampaign: builder.mutation<Campaign, CreateCampaignRequest>({
			queryFn: async (campaignData) => {
				try {
					if (APP_CONFIG.MOCK_MODE) {
						await delay(APP_CONFIG.MOCK_DELAY_MS);
						const mock: Campaign = {
							id: `cmp_${Date.now()}`,
							name: campaignData.name,
							tags: campaignData.tags || [],
							status: 'DRAFT',
							channelType: 'EMAIL',
							scheduledAt: campaignData.scheduledAt || null,
							emailConfig: {
								subject: campaignData.subject,
								senderName: campaignData.senderName,
								senderEmail: campaignData.senderEmail || '',
								leadGroup: { name: 'Mock Group' },
							},
							analytics: {
								PENDING: 0,
								SENT: 0,
								DELIVERED: 0,
								OPENED: 0,
								CLICKED: 0,
								BOUNCED: 0,
								FAILED: 0,
							},
							createdAt: new Date().toISOString(),
							updatedAt: new Date().toISOString(),
						};
						return { data: mock };
					}

					const token = getAccessToken();
					const response = await fetch(
						`${APP_CONFIG.API_BASE_URL}/admin/campaigns/campaigns`,
						{
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
								Authorization: `Bearer ${token}`,
							},
							body: JSON.stringify(campaignData),
						}
					);

					const responseData = await response.json();

					if (!response.ok) {
						return {
							error: {
								status: response.status,
								data: responseData.message || 'Failed to create campaign',
							},
						};
					}

					return { data: transformCampaign(responseData.data) };
				} catch (error) {
					return {
						error: {
							status: 500,
							data:
								error instanceof Error
									? error.message
									: 'Failed to create campaign',
						},
					};
				}
			},
			invalidatesTags: ['Campaigns'],
		}),

		// UPDATE campaign
		updateCampaign: builder.mutation<
			Campaign,
			{ id: string; data: UpdateCampaignRequest }
		>({
			queryFn: async ({ id, data }) => {
				try {
					if (APP_CONFIG.MOCK_MODE) {
						await delay(APP_CONFIG.MOCK_DELAY_MS);
						const mock = mockCampaigns.find((c) => c.id === id);
						if (!mock) throw new Error('Campaign not found');
						return { data: transformCampaign({ ...mock, ...data }) };
					}

					const token = getAccessToken();
					const response = await fetch(
						`${APP_CONFIG.API_BASE_URL}/admin/campaigns/campaigns/${id}`,
						{
							method: 'PATCH',
							headers: {
								'Content-Type': 'application/json',
								Authorization: `Bearer ${token}`,
							},
							body: JSON.stringify(data),
						}
					);

					const responseData = await response.json();

					if (!response.ok) {
						return {
							error: {
								status: response.status,
								data: responseData.message || 'Failed to update campaign',
							},
						};
					}

					return { data: transformCampaign(responseData.data) };
				} catch (error) {
					return {
						error: {
							status: 500,
							data:
								error instanceof Error
									? error.message
									: 'Failed to update campaign',
						},
					};
				}
			},
			invalidatesTags: (_result, _error, { id }) => [
				'Campaigns',
				{ type: 'Campaign', id },
			],
		}),

		// DELETE campaign
		deleteCampaign: builder.mutation<{ success: boolean }, string>({
			queryFn: async (id) => {
				try {
					if (APP_CONFIG.MOCK_MODE) {
						await delay(APP_CONFIG.MOCK_DELAY_MS);
						return { data: { success: true } };
					}

					const token = getAccessToken();
					const response = await fetch(
						`${APP_CONFIG.API_BASE_URL}/admin/campaigns/campaigns/${id}`,
						{
							method: 'DELETE',
							headers: {
								Authorization: `Bearer ${token}`,
							},
						}
					);

					const responseData = await response.json();

					if (!response.ok) {
						return {
							error: {
								status: response.status,
								data: responseData.message || 'Failed to delete campaign',
							},
						};
					}

					return { data: { success: true } };
				} catch (error) {
					return {
						error: {
							status: 500,
							data:
								error instanceof Error
									? error.message
									: 'Failed to delete campaign',
						},
					};
				}
			},
			invalidatesTags: ['Campaigns'],
		}),

		// LAUNCH campaign
		launchCampaign: builder.mutation<{ success: boolean }, string>({
			queryFn: async (id) => {
				try {
					if (APP_CONFIG.MOCK_MODE) {
						await delay(APP_CONFIG.MOCK_DELAY_MS);
						return { data: { success: true } };
					}

					const token = getAccessToken();
					const response = await fetch(
						`${APP_CONFIG.API_BASE_URL}/admin/campaigns/campaigns/${id}/launch`,
						{
							method: 'POST',
							headers: {
								Authorization: `Bearer ${token}`,
							},
						}
					);

					const responseData = await response.json();

					if (!response.ok) {
						return {
							error: {
								status: response.status,
								data: responseData.message || 'Failed to launch campaign',
							},
						};
					}

					return { data: { success: true } };
				} catch (error) {
					return {
						error: {
							status: 500,
							data:
								error instanceof Error
									? error.message
									: 'Failed to launch campaign',
						},
					};
				}
			},
			invalidatesTags: (_result, _error, id) => [
				'Campaigns',
				{ type: 'Campaign', id },
			],
		}),

		// CAMPAIGN status action (SUSPEND/RESTART)
		campaignStatusAction: builder.mutation<
			{ success: boolean },
			{ id: string; action: 'SUSPEND' | 'RESTART'; newScheduledAt?: string }
		>({
			queryFn: async ({ id, action, newScheduledAt }) => {
				try {
					if (APP_CONFIG.MOCK_MODE) {
						await delay(APP_CONFIG.MOCK_DELAY_MS);
						return { data: { success: true } };
					}

					const token = getAccessToken();
					const response = await fetch(
						`${APP_CONFIG.API_BASE_URL}/admin/campaigns/campaigns/${id}/status-action`,
						{
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
								Authorization: `Bearer ${token}`,
							},
							body: JSON.stringify({ action, newScheduledAt }),
						}
					);

					const responseData = await response.json();

					if (!response.ok) {
						return {
							error: {
								status: response.status,
								data: responseData.message || 'Failed to update campaign status',
							},
						};
					}

					return { data: { success: true } };
				} catch (error) {
					return {
						error: {
							status: 500,
							data:
								error instanceof Error
									? error.message
									: 'Failed to update campaign status',
						},
					};
				}
			},
			invalidatesTags: (_result, _error, { id }) => [
				'Campaigns',
				{ type: 'Campaign', id },
			],
		}),
	}),
});

export const {
	useGetCampaignsQuery,
	useGetCampaignByIdQuery,
	useCreateCampaignMutation,
	useUpdateCampaignMutation,
	useDeleteCampaignMutation,
	useLaunchCampaignMutation,
	useCampaignStatusActionMutation,
} = campaignApi;