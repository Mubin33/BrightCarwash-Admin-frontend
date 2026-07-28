export interface KnowledgeFile {
    id: number;
    title: string;
    file: string;
    uploaded_at: string;
    updated_at: string;
    processed_at: string | null;
    is_processed: boolean;
    processing_error: string | null;
    chunk_count: number;
}

export interface KnowledgeChunk {
    id: number;
    chunk_index: number;
    chunk_text: string;
    metadata: string;
    created_at: string;
    updated_at: string;
}

export interface KnowledgeFileDetail extends KnowledgeFile {
    chunks: KnowledgeChunk[];
}

export interface UploadKnowledgeRequest {
    title: string;
    file: File;
}

export interface KnowledgeListResponse {
    success: boolean;
    message: string;
    data: KnowledgeFile[];
}

export interface KnowledgeDetailResponse {
    success: boolean;
    message: string;
    data: KnowledgeFileDetail;
}

export interface KnowledgeUploadResponse {
    success: boolean;
    message: string;
    data: KnowledgeFile;
}

export interface KnowledgeDeleteResponse {
    success: boolean;
    message: string;
    data: null;
}

export interface KnowledgeFileStatus {
    id: number;
    title: string;
    is_processed: boolean;
    processing_error: string | null;
    chunk_count: number;
}