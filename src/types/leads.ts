export interface Lead {
	id: string;
	name: string;
	phone: string;
	email: string;
	avatar: string;
	service: string;
	vehicle: string;
	source: string;
	priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
	deposit: number;
	depositStatus: 'PENDING' | 'PAID' | 'NONE';
	stage: string;
	stageId: string;
	assignedToId: string | null;
	notes: string[];
	date: string;
}

export interface CreateLeadRequest {
	name: string;
	email: string;
	phone: string;
	service: string;
	vehicle: string;
	source: string;
	priority: Lead["priority"];
	deposit_status: Lead["depositStatus"];
	stage_name?: string;
	stage?: string;
	notes?: string[];
}

export interface UpdateLeadRequest extends Partial<CreateLeadRequest> {
	assigned_to_id?: string;
}

export interface LeadApiResponse {
	id: string;
	name: string;
	email: string;
	phone: string;
	service: string;
	vehicle: string;
	source: string;
	priority: string;
	deposit_status: string;
	stage_id: string;
	stage?: { id: string; name: string; color: string };
	assigned_to_id?: string | null;
	notes?: string[];
	created_at: string;
}

export type LeadDepositStatus = Lead['depositStatus'];
export type LeadStage = string;
