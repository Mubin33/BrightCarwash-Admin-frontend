export interface Testimonial {
    id: string;
    name: string;
    designation: string;
    ratings: number;
    review_text: string;
    avatar?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateTestimonialRequest {
    name: string;
    designation: string;
    ratings: number;
    review_text: string;
    avatar_image?: File;
    is_active?: boolean;
}

export interface UpdateTestimonialRequest {
    name?: string;
    designation?: string;
    ratings?: number;
    review_text?: string;
    avatar_image?: File;
    is_active?: boolean;
    is_avatar_deleted?: boolean;
}

export interface TestimonialListResponse {
    success: boolean;
    message: string;
    data: {
        testimonials: Testimonial[];
        meta: {
            total_items: number;
            current_page: number;
            per_page: number;
            total_pages: number;
        };
    };
}

export interface TestimonialSingleResponse {
    success: boolean;
    message: string;
    data: Testimonial;
}