/**
 * File validation utilities for upload forms across the admin dashboard.
 * Prevents SVG Stored-XSS vectors and client timeouts from excessively large files.
 * (Audit Issue VAL-004)
 */

export const ALLOWED_IMAGE_TYPES = [
    'image/png',
    'image/jpeg',
    'image/webp',
];

export const ALLOWED_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];

export const IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp';

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export const ALLOWED_ATTACHMENT_TYPES = [
    'image/png',
    'image/jpeg',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
];

export const ALLOWED_ATTACHMENT_EXTENSIONS = [
    '.png',
    '.jpg',
    '.jpeg',
    '.webp',
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.txt',
    '.csv',
];

export const ATTACHMENT_ACCEPT =
    'image/png,image/jpeg,image/webp,application/pdf,.doc,.docx,.xls,.xlsx,text/plain,text/csv';

export const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

// ==========================================
// Lead Attachments Rules (NestJS server: 25MB, images & PDF only, refuses office files)
// Finding A-19
// ==========================================
export const ALLOWED_LEAD_ATTACHMENT_TYPES = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
];

export const ALLOWED_LEAD_ATTACHMENT_EXTENSIONS = [
    '.pdf',
    '.png',
    '.jpg',
    '.jpeg',
    '.webp',
];

export const LEAD_ATTACHMENT_ACCEPT =
    'application/pdf,image/png,image/jpeg,image/webp';

export const MAX_LEAD_ATTACHMENT_SIZE_BYTES = 25 * 1024 * 1024; // 25MB (aligned with server)

export function validateLeadAttachmentFile(
    file: File,
    maxSizeBytes = MAX_LEAD_ATTACHMENT_SIZE_BYTES
): FileValidationResult {
    return validateFile(file, {
        maxSizeBytes,
        allowedTypes: ALLOWED_LEAD_ATTACHMENT_TYPES,
        allowedExtensions: ALLOWED_LEAD_ATTACHMENT_EXTENSIONS,
        label: 'Lead attachment',
    });
}

// ==========================================
// Knowledge Base Upload Rules (Django server: 10MB, office files & documents)
// Finding A-19
// ==========================================
export const ALLOWED_KNOWLEDGE_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain',
    'text/csv',
    'application/csv',
    'text/x-csv',
    'application/x-csv',
    'text/comma-separated-values',
    'text/x-comma-separated-values',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export const ALLOWED_KNOWLEDGE_EXTENSIONS = [
    '.pdf',
    '.docx',
    '.doc',
    '.txt',
    '.csv',
    '.xlsx',
    '.xls',
];

export const KNOWLEDGE_FILE_ACCEPT = ALLOWED_KNOWLEDGE_EXTENSIONS.join(',');

export const MAX_KNOWLEDGE_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB (aligned with Django)

export function validateKnowledgeFile(
    file: File,
    maxSizeBytes = MAX_KNOWLEDGE_FILE_SIZE_BYTES
): FileValidationResult {
    return validateFile(file, {
        maxSizeBytes,
        allowedTypes: ALLOWED_KNOWLEDGE_TYPES,
        allowedExtensions: ALLOWED_KNOWLEDGE_EXTENSIONS,
        label: 'Knowledge file',
    });
}


export interface FileValidationOptions {
    maxSizeBytes?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
    label?: string;
}

export interface FileValidationResult {
    isValid: boolean;
    error?: string;
}

export function validateFile(
    file: File,
    options: FileValidationOptions = {}
): FileValidationResult {
    if (!file) {
        return { isValid: false, error: 'No file selected.' };
    }

    const {
        maxSizeBytes = MAX_IMAGE_SIZE_BYTES,
        allowedTypes = ALLOWED_IMAGE_TYPES,
        allowedExtensions = ALLOWED_IMAGE_EXTENSIONS,
        label = 'File',
    } = options;

    const fileName = file.name || '';
    const lastDotIndex = fileName.lastIndexOf('.');
    const ext = lastDotIndex !== -1 ? fileName.slice(lastDotIndex).toLowerCase() : '';

    // Strictly forbid SVG due to stored XSS vectors (embedded scripts)
    if (
        file.type === 'image/svg+xml' ||
        ext === '.svg' ||
        fileName.toLowerCase().endsWith('.svg')
    ) {
        return {
            isValid: false,
            error: 'SVG files are not permitted for security reasons.',
        };
    }

    // Size validation
    if (file.size > maxSizeBytes) {
        const maxMB = (maxSizeBytes / (1024 * 1024)).toFixed(0);
        return {
            isValid: false,
            error: `${label} size exceeds ${maxMB}MB limit.`,
        };
    }

    // Type and extension validation
    const matchesMime = Boolean(file.type && allowedTypes.includes(file.type.toLowerCase()));
    const matchesExt = Boolean(ext && allowedExtensions.includes(ext));

    if (!matchesMime && !matchesExt) {
        const readableExts = allowedExtensions
            .map((e) => e.replace('.', '').toUpperCase())
            .join(', ');
        return {
            isValid: false,
            error: `Unsupported file format. Please upload ${readableExts}.`,
        };
    }

    return { isValid: true };
}

export function validateImageFile(
    file: File,
    maxSizeBytes = MAX_IMAGE_SIZE_BYTES
): FileValidationResult {
    return validateFile(file, {
        maxSizeBytes,
        allowedTypes: ALLOWED_IMAGE_TYPES,
        allowedExtensions: ALLOWED_IMAGE_EXTENSIONS,
        label: 'Image',
    });
}

export function validateAvatarFile(
    file: File,
    maxSizeBytes = MAX_AVATAR_SIZE_BYTES
): FileValidationResult {
    return validateFile(file, {
        maxSizeBytes,
        allowedTypes: ALLOWED_IMAGE_TYPES,
        allowedExtensions: ALLOWED_IMAGE_EXTENSIONS,
        label: 'Avatar',
    });
}

export function validateAttachmentFile(
    file: File,
    maxSizeBytes = MAX_ATTACHMENT_SIZE_BYTES
): FileValidationResult {
    return validateFile(file, {
        maxSizeBytes,
        allowedTypes: ALLOWED_ATTACHMENT_TYPES,
        allowedExtensions: ALLOWED_ATTACHMENT_EXTENSIONS,
        label: 'Attachment',
    });
}
