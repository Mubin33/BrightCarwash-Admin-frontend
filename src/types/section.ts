export interface SectionContent {
    title: string;
    subtitle?: string;
    background_image_url?: string;
    backgroundImageUrl?: string | string[];
}

export interface Section {
    section_key: string;
    section_type: string;
    content: SectionContent;
    is_active: boolean;
    sort_order: number;
    created_at?: string;
    updated_at?: string;
}

export interface SectionListResponse {
    success: boolean;
    message: string;
    data: {
        data: Section[];
        meta?: {
            total_items: number;
            current_page: number;
            per_page: number;
            total_pages: number;
            has_next_page?: boolean;
            has_previous_page?: boolean;
        };
    };
}

export interface SectionSingleResponse {
    success: boolean;
    message: string;
    data: Section;
}

export interface CreateSectionRequest {
    key: string;
    section_key: string;
    section_type: string;
    content: SectionContent;
    is_active: boolean;
    sort_order: number;
}

export interface UpdateSectionRequest {
    section_type?: string;
    content?: SectionContent;
    is_active?: boolean;
    sort_order?: number;
}
