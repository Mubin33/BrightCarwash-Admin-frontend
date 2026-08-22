export interface Stage {
	id: string;
	name: string;
	color: string;
	sort_order: number;
	icon: string | null;
	lead_count?: number;
}

export interface StageResponse {
	success: boolean;
	data: Stage[];
}

export interface SingleStageResponse {
	success: boolean;
	message: string;
	data: Stage;
}

export interface CreateStageRequest {
	name: string;
	color: string;
	sort_order?: number;
	file?: File | null;
}

export interface StageOption {
	value: string;
	label: string;
	color: string;
	stageId: string;
	icon?: string | null;
}