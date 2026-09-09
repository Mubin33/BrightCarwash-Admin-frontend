export interface LeadDetail {
	id: string;
	name: string;
	email: string;
	phone: string;
	service: string;
	vehicle: string;
	source: string;
	priority: string;
	depositStatus: string;
	stage: string;
	stageId: string;
	stageColor: string;
	assignedToId: string | null;
	assignedToName: string | null;
	avatar: string;
	notes: { id: string; content: string; author: string; date: string }[];
	attachments: { id: string; url: string; fileName: string; fileSize: number; mimeType: string; uploadedAt?: string }[];
	date: string;
	activities: ActivityItem[];
}

export interface Note {
	id: string;
	content: string;
	author: string;
	date: string;
}

export interface Attachment {
	id: string;
	url: string;
	fileName: string;
	fileSize: number;
	mimeType: string;
	uploadedAt?: string;
}

export type ActivityType = 'lead' | 'stage' | 'staff' | 'coupon';

export interface ActivityItem {
	id: string;
	type: ActivityType;
	title?: string;
	subtitle?: string;
	description?: string;
	user: string;
	date: string;
}

export interface LeadDetailApiResponse {
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
	assigned_to?: { id: string; first_name: string; last_name: string } | null;
	notes?: string[] | { id: string; content: string; author: { first_name: string; last_name: string } | null; created_at: string }[];
	attachments?: string[] | { id: string; url: string; fileName: string; fileSize: number; mimeType: string }[];
	attachments_url_paths?: { filename: string; url: string }[];
	created_at: string;
	activity_timelines?: {
		id: string;
		description: string;
		created_at: string;
		user_id: string | null;
		user: { id: string; first_name: string; last_name: string } | null;
		source: string;
	}[];
	assignment_history?: {
		id: string;
		assigned_to_id: string | null;
		assignee: { id: string; first_name: string; last_name: string; email: string } | null;
		assigned_by_id: string;
		assigner: { id: string; first_name: string; last_name: string; email: string } | null;
	}[];
}