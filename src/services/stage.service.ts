import { APP_CONFIG } from '@/configs/app.config';
import type {
	Stage,
	StageResponse,
	SingleStageResponse,
	CreateStageRequest,
} from '@/types/stage';
import { mockStages } from '@/mocks/stage.mock';
import { getAccessToken } from '@/lib/auth-client';

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchFromBackend<T>(
	url: string,
	options?: RequestInit,
): Promise<T> {
	const token = getAccessToken();
	const res = await fetch(`${APP_CONFIG.API_BASE_URL}${url}`, {
		...options,
		headers: { Authorization: `Bearer ${token}`, ...options?.headers },
	});
	if (!res.ok) throw new Error(`Request failed: ${res.status}`);
	return res.json();
}

export async function getStages(): Promise<Stage[]> {
	if (APP_CONFIG.MOCK_MODE || APP_CONFIG.DASHBOARD_MOCK) {
		await delay(APP_CONFIG.MOCK_DELAY_MS);
		return [...mockStages];
	}
	const json = await fetchFromBackend<StageResponse>('/admin/lead/stages');
	return json.data;
}

export async function deleteStage(id: string): Promise<void> {
	const token = getAccessToken();
	const res = await fetch(`${APP_CONFIG.API_BASE_URL}/admin/stage/${id}`, {
		method: 'DELETE',
		headers: { Authorization: `Bearer ${token}` },
	});
	if (!res.ok) throw new Error(`Request failed: ${res.status}`);
}

export async function createStage(data: CreateStageRequest): Promise<Stage> {
	if (APP_CONFIG.MOCK_MODE || APP_CONFIG.DASHBOARD_MOCK) {
		await delay(APP_CONFIG.MOCK_DELAY_MS);
		const newStage: Stage = {
			id: `stage_${Date.now()}`,
			name: data.name,
			color: data.color,
			sort_order: data.sort_order || mockStages.length + 1,
			icon: null,
		};
		mockStages.push(newStage);
		return { ...newStage };
	}
	const token = getAccessToken();
	const formData = new FormData();
	formData.append('name', data.name);
	formData.append('color', data.color);
	if (data.sort_order) formData.append('sort_order', String(data.sort_order));
	if (data.file) formData.append('file', data.file);

	const res = await fetch(`${APP_CONFIG.API_BASE_URL}/admin/stage`, {
		method: 'POST',
		headers: { Authorization: `Bearer ${token}` },
		body: formData,
	});

	const json = await res.json();

	if (!res.ok) {
		throw new Error(json.message || `Request failed: ${res.status}`);
	}

	return json.data;
}