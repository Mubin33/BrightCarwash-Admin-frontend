import { fetchFromBackend, apiFetch } from "@/lib/api-fetch";
import { APP_CONFIG } from '@/configs/app.config';
import type {
	Stage,
	StageResponse,
	CreateStageRequest,
	UpdateStageRequest,
} from '@/types/stage';

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// Centralized fetchFromBackend imported from @/lib/api-fetch

export async function getStages(): Promise<Stage[]> {
	if (process.env.NODE_ENV !== "production" && (APP_CONFIG.MOCK_MODE || APP_CONFIG.DASHBOARD_MOCK)) {
		await delay(APP_CONFIG.MOCK_DELAY_MS);
		const { mockStages } = await import('@/mocks/stage.mock');
		return [...mockStages];
	}
	const json = await fetchFromBackend<StageResponse>('/admin/lead/stages');
	return json.data;
}

export async function deleteStage(id: string): Promise<void> {
	const res = await apiFetch(`/admin/stage/${id}`, {
		method: 'DELETE',
	});
	if (!res.ok) throw new Error(`Request failed: ${res.status}`);
}

export async function createStage(data: CreateStageRequest): Promise<Stage> {
	if (process.env.NODE_ENV !== "production" && (APP_CONFIG.MOCK_MODE || APP_CONFIG.DASHBOARD_MOCK)) {
		await delay(APP_CONFIG.MOCK_DELAY_MS);
		const { mockStages } = await import('@/mocks/stage.mock');
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
	const formData = new FormData();
	formData.append('name', data.name);
	formData.append('color', data.color);
	if (data.sort_order) formData.append('sort_order', String(data.sort_order));
	if (data.file) formData.append('file', data.file);

	const res = await apiFetch('/admin/stage', {
		method: 'POST',
		body: formData,
	});

	const json = await res.json();

	if (!res.ok) {
		throw new Error(json.message || `Request failed: ${res.status}`);
	}

	return json.data;
}
export async function updateStage(
	id: string,
	data: UpdateStageRequest,
): Promise<Stage> {
	if (process.env.NODE_ENV !== "production" && (APP_CONFIG.MOCK_MODE || APP_CONFIG.DASHBOARD_MOCK)) {
		await delay(APP_CONFIG.MOCK_DELAY_MS);
		const { mockStages } = await import('@/mocks/stage.mock');
		const stage = mockStages.find((s) => s.id === id);
		if (stage) {
			if (data.name) stage.name = data.name;
			if (data.color) stage.color = data.color;
			if (data.sort_order !== undefined) stage.sort_order = data.sort_order;
			return { ...stage };
		}
	}
	const formData = new FormData();
	if (data.name) formData.append('name', data.name);
	if (data.color) formData.append('color', data.color);
	if (data.sort_order !== undefined) formData.append('sort_order', String(data.sort_order));
	if (data.file) formData.append('file', data.file);

	const res = await apiFetch(`/admin/stage/${id}`, {
		method: 'PATCH',
		body: formData,
	});

	const json = await res.json();

	if (!res.ok) {
		throw new Error(json.message || `Request failed: ${res.status}`);
	}

	return json.data;
}
