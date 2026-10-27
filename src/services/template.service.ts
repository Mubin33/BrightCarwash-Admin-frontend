import { APP_CONFIG } from '@/configs/app.config';
import type { Template } from '@/types/template';
import axiosInstance from '@/lib/axios-instance';

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}


function transformTemplate(apiTemplate: Template): Template {
	let htmlContent = apiTemplate.emailBody?.htmlContent || '';

	if (!htmlContent.trim()) {
		htmlContent = '<div style="padding:20px;color:#666;font-family:sans-serif;">No content available</div>';
	}

	return {
		...apiTemplate,
		html: htmlContent,
		subject: apiTemplate.emailBody?.subject || 'No subject',
		emailBody: {
			...apiTemplate.emailBody,
			htmlContent: htmlContent,
		},
	};
}

export async function getSavedTemplates(): Promise<Template[]> {
	if (process.env.NODE_ENV !== "production" && (APP_CONFIG.MOCK_MODE || APP_CONFIG.DASHBOARD_MOCK)) {
		await delay(APP_CONFIG.MOCK_DELAY_MS);
		const { mockSavedTemplates } = await import('@/mocks/template.mock');
		const stored = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('savedTemplates') || '[]') : [];
		return [...mockSavedTemplates, ...stored];
	}
	try {
		const { data } = await axiosInstance.get<{
			success: boolean;
			message: string;
			data: Template[];
			meta: Record<string, unknown>;
		}>('/admin/templates?isArchived=false&limit=100');

		return data.data.map(transformTemplate);
	} catch (error) {
		console.error('Failed to fetch templates:', error);
		return [];
	}
}

export async function getCampaignTemplates(): Promise<Template[]> {
	if (process.env.NODE_ENV !== "production" && (APP_CONFIG.MOCK_MODE || APP_CONFIG.DASHBOARD_MOCK)) {
		await delay(APP_CONFIG.MOCK_DELAY_MS);
		const { mockCampaignTemplates } = await import('@/mocks/template.mock');
		return [...mockCampaignTemplates];
	}
	try {
		const { data } = await axiosInstance.get<{
			success: boolean;
			message: string;
			data: Template[];
			meta: Record<string, unknown>;
		}>('/admin/templates?type=EMAIL&isArchived=false&limit=100');

		return data.data.map(transformTemplate);
	} catch (error) {
		console.error('Failed to fetch campaign templates:', error);
		return [];
	}
}