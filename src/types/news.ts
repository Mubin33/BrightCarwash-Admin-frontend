export interface Category {
    id: string;
    name: string;
    slug?: string;
    created_at: string;
    updated_at: string;
}

export interface CategoryListResponse {
    success: boolean;
    message: string;
    data: Category[];
}

export interface CreateCategoryRequest {
    name: string;
}

export interface UpdateCategoryRequest {
    name: string;
}

export interface NewsItem {
    id: string;
    title: string;
    slug: string;
    content: string;
    summary: string;
    image_url: string;
    category_id: string;
    category?: Category;
    creator?: {
        id: string;
        first_name: string;
        last_name: string;
    };
    is_published: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateNewsRequest {
    title: string;
    content: string;
    summary?: string;
    image: File;
    category_id: string;
    is_published?: boolean;
}

export interface UpdateNewsRequest {
    title?: string;
    content?: string;
    summary?: string;
    image?: File;
    category_id?: string;
    is_published?: boolean;
}

export interface NewsListResponse {
    success: boolean;
    message: string;
    data: {
        items: NewsItem[];
        meta: {
            total_items: number;
            current_page: number;
            per_page: number;
            total_pages: number;
        };
    };
}

export interface NewsSingleResponse {
    success: boolean;
    message: string;
    data: NewsItem;
}