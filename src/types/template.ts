export type TemplateType = 'EMAIL' | 'SMS' | 'PUSH';

export type EditorType = 'VISUAL_DRAG_DROP' | 'RAW_HTML' | 'PLAIN_TEXT';

export interface EmailBody {
	id?: string;
	templateId?: string;
	subject: string;
	htmlContent: string;
	designJson?: Record<string, any>;
}

export interface Template {
	id: string;
	name: string;
	description: string | null;
	type: TemplateType;
	editorType: EditorType;
	userId: string | null;
	isArchived: boolean;
	createdAt: string;
	updatedAt: string;
	emailBody: EmailBody;
	html: string; // For backward compatibility
	subject?: string; // For backward compatibility
}

export interface CreateTemplateRequest {
	name: string;
	description?: string;
	type: TemplateType;
	editorType: EditorType;
	emailBody: {
		subject: string;
		htmlContent: string;
		designJson?: Record<string, any>;
	};
}

export interface UpdateTemplateRequest extends Partial<CreateTemplateRequest> { }

export interface TemplateListResponse {
	success: boolean;
	message: string;
	data: Template[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
		nextPage: number | null;
		prevPage: number | null;
	};
}

export interface TemplateResponse {
	success: boolean;
	message: string;
	data: Template;
}