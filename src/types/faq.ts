export interface FAQ {
    id: string;
    question: string;
    answer: string;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateFAQRequest {
    question: string;
    answer: string;
    display_order?: number;
    is_active?: boolean;
}

export interface UpdateFAQRequest extends Partial<CreateFAQRequest> { }

export interface FAQListResponse {
    success: boolean;
    message: string;
    data: {
        faqs: FAQ[];
        meta: {
            total_items: number;
            current_page: number;
            per_page: number;
            total_pages: number;
            has_next_page: boolean;
            has_previous_page: boolean;
        };
    };
}

export interface FAQSingleResponse {
    success: boolean;
    message: string;
    data: FAQ;
}