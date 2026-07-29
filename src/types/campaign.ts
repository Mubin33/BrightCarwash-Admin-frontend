export type CampaignType = "All Campaign" | "E-mail Template";
export type CampaignStatus = "DRAFT" | "SCHEDULED" | "RUNNING" | "ACTIVE" | "COMPLETED" | "SUSPENDED";
export type CampaignChannelType = "EMAIL" | "SMS" | "PUSH";


export const TYPE_FILTERS: CampaignType[] = ["All Campaign", "E-mail Template"];
export const STATUS_FILTERS: CampaignStatus[] = ["ACTIVE", "COMPLETED", "DRAFT", "RUNNING", "SCHEDULED", "SUSPENDED"];


export const CHANNEL_TO_TYPE: Record<CampaignChannelType, "E-mail Template"> = {
	EMAIL: "E-mail Template",
	SMS: "E-mail Template",
	PUSH: "E-mail Template",
};

export interface CampaignAnalytics {
	PENDING: number;
	SENT: number;
	DELIVERED: number;
	OPENED: number;
	CLICKED: number;
	BOUNCED: number;
	FAILED: number;
}

export interface CampaignEmailConfig {
	subject: string;
	senderName?: string;
	senderEmail: string;
	leadGroup: {
		name: string;
	};
	leadGroupId?: string | null;
	templateId?: string | null;
	htmlContent?: string;
}


export interface Campaign {
	id: string;
	name: string;
	tags: string[];
	status: CampaignStatus;
	channelType: CampaignChannelType;
	scheduledAt: string | null;
	emailConfig: CampaignEmailConfig;
	analytics: CampaignAnalytics;
	createdAt: string;
	updatedAt: string;
}

export interface CreateCampaignRequest {
	name: string;
	tags: string[];
	subject: string;
	templateId?: string;
	senderName?: string;
	senderEmail?: string;
	leadGroupId: string;
	scheduledAt?: string | null;
}

export interface UpdateCampaignRequest extends Partial<CreateCampaignRequest> { }

export interface CampaignListResponse {
	success: boolean;
	message: string;
	data: {
		campaigns: Campaign[];
		meta: {
			totalItems: number;
			itemCount: number;
			itemsPerPage: number;
			totalPages: number;
			currentPage: number;
			hasNextPage: boolean;
			hasPreviousPage: boolean;
		};
	};
}

export interface CampaignResponse {
	success: boolean;
	message: string;
	data: Campaign;
}

export interface LeadGroup {
	id: string;
	name: string;
	description: string | null;
	brevoListId: number | null;
	createdAt: string;
	updatedAt: string;
	_count?: {
		leads: number;
	};
}

export interface LeadGroupsListResponse {
	success: boolean;
	message: string;
	data: {
		groups: LeadGroup[];
		meta: {
			totalItems: number;
			itemCount: number;
			itemsPerPage: number;
			totalPages: number;
			currentPage: number;
			hasNextPage: boolean;
			hasPreviousPage: boolean;
		};
	};
}