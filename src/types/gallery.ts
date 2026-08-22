export interface GalleryItem {
    id: string;
    name: string;
    image: string;
    is_published: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateGalleryRequest {
    name: string;
    file: File;
    is_published?: boolean;
}

export interface UpdateGalleryRequest {
    name?: string;
    file?: File;
    is_published?: boolean;
}

export interface GalleryListResponse {
    success: boolean;
    message: string;
    data: {
        galleries: GalleryItem[];
        meta: {
            total_items: number;
            current_page: number;
            per_page: number;
            total_pages: number;
        };
    };
}

export interface GallerySingleResponse {
    success: boolean;
    message: string;
    data: GalleryItem;
}