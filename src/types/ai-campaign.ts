export interface Campaign {
    id: number;
    title: string;
    description: string;
    image: string | null;
    is_active: boolean;
    start_date: string | null;
    end_date: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateCampaignRequest {
    title: string;
    description: string;
    image?: File | null;
    is_active?: boolean;
    start_date?: string;
    end_date?: string;
}

export interface UpdateCampaignRequest {
    title?: string;
    description?: string;
    image?: File | null;
    is_active?: boolean;
    start_date?: string;
    end_date?: string;
}

export interface CampaignListResponse {
    success: boolean;
    message: string;
    data: Campaign[];
}

export interface CampaignDetailResponse {
    success: boolean;
    message: string;
    data: Campaign;
}

export interface CampaignCreateResponse {
    success: boolean;
    message: string;
    data: Campaign;
}

export interface CampaignDeleteResponse {
    success: boolean;
    message: string;
    data: null;
}