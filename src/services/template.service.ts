import { APP_CONFIG } from '@/configs/app.config';
import type { Template } from '@/types/template';
import {
	mockSavedTemplates,
	mockCampaignTemplates,
} from '@/mocks/template.mock';
import axiosInstance from '@/lib/axios-instance';

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}


function transformTemplate(apiTemplate: any): Template {
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
	if (APP_CONFIG.MOCK_MODE || APP_CONFIG.DASHBOARD_MOCK) {
		await delay(APP_CONFIG.MOCK_DELAY_MS);
		const stored = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('savedTemplates') || '[]') : [];
		return [...mockSavedTemplates, ...stored];
	}
	try {
		const { data } = await axiosInstance.get<{
			success: boolean;
			message: string;
			data: any[];
			meta: any;
		}>('/admin/templates?isArchived=false&limit=100');

		return data.data.map(transformTemplate);
	} catch (error) {
		console.error('Failed to fetch templates:', error);
		return [];
	}
}

export async function getCampaignTemplates(): Promise<Template[]> {
	if (APP_CONFIG.MOCK_MODE || APP_CONFIG.DASHBOARD_MOCK) {
		await delay(APP_CONFIG.MOCK_DELAY_MS);
		return [...mockCampaignTemplates];
	}
	try {
		const { data } = await axiosInstance.get<{
			success: boolean;
			message: string;
			data: any[];
			meta: any;
		}>('/admin/templates?type=EMAIL&isArchived=false&limit=100');

		return data.data.map(transformTemplate);
	} catch (error) {
		console.error('Failed to fetch campaign templates:', error);
		return [];
	}
}