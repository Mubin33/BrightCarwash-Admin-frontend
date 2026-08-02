export interface EmailLog {
    id: string;
    createdAt: string;
    sender_name: string;
    sender_mail: string;
    to: string;
    cc: string;
    bcc: string;
    subject: string;
    body: string;
    files: string[];
    status: string;
    is_opened: boolean;
    is_clicked: boolean;
    leadId: string | null;
    creator: {
        first_name: string;
        last_name: string;
        email: string;
    };
    lead: {
        name: string;
    } | null;
}

export interface EmailLogListResponse {
    success: boolean;
    message: string;
    data: {
        data: EmailLog[];
        meta: {
            totalItems: number;
            itemCount: number;
            itemsPerPage: number;
            totalPages: number;
            currentPage: number;
        };
    };
}

export interface ComposeEmailFormState {
    from: string;
    to: string;
    cc: string;
    bcc: string;
    subject: string;
    body: string;
    files: File[];
    useTemplate: boolean;
    templateId: string;
    showCcBcc: boolean;
}

export interface SendEmailRequest {
    to: string;
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    files?: File[];
}

export interface EmailLogDetailResponse {
    success: boolean;
    message: string;
    data: EmailLog;
}