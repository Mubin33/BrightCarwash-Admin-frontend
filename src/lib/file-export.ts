import { apiFetch } from '@/lib/api-fetch';
import { saveAs } from 'file-saver';

export type ExportFormat = 'excel' | 'csv' | 'txt' | 'pdf' | 'word';

export interface ExportOptions {
    fileName?: string;
    sheetName?: string;
    headers?: string[];
    data: Record<string, unknown>[];
    format: ExportFormat;
}

export interface DownloadOptions {
    fileUrl: string;
    fileName: string;
    fileExtension: string;
}

export interface ExportResult {
    success: boolean;
    message: string;
    data?: unknown;
}

const AI_BASE_URL = process.env.NEXT_PUBLIC_AI_BASE_URL?.replace(/\/$/, '') || '';

class FileExportService {
    private static instance: FileExportService;
    private constructor() { }

    public static getInstance(): FileExportService {
        if (!FileExportService.instance) {
            FileExportService.instance = new FileExportService();
        }
        return FileExportService.instance;
    }

    /**
     * Validate whether a file URL origin is allowed for download.
     */
    private isAllowedDownloadHost(urlStr: string): boolean {
        if (!urlStr) return false;
        // Relative paths will be resolved to trusted AI_BASE_URL
        if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
            return true;
        }

        try {
            const parsed = new URL(urlStr);
            const host = parsed.hostname.toLowerCase();

            // Check against configured storage host (exact or subdomain match)
            const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL;
            if (storageUrl) {
                try {
                    const storageHost = new URL(storageUrl).hostname.toLowerCase();
                    if (host === storageHost || host.endsWith(`.${storageHost}`)) return true;
                } catch {
                    // Ignore invalid URL
                }
            }

            // Check against configured AI host
            if (AI_BASE_URL) {
                try {
                    const aiHost = new URL(AI_BASE_URL).hostname.toLowerCase();
                    if (host === aiHost || host.endsWith(`.${aiHost}`)) return true;
                } catch {
                    // Ignore invalid URL
                }
            }

            // Check against configured API host
            const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
            if (apiUrl) {
                try {
                    const apiHost = new URL(apiUrl).hostname.toLowerCase();
                    if (host === apiHost || host.endsWith(`.${apiHost}`)) return true;
                } catch {
                    // Ignore invalid URL
                }
            }

            // Allowed cloud storage domains (AWS S3, DigitalOcean Spaces, CloudFront)
            if (
                host.endsWith('.amazonaws.com') ||
                host.endsWith('.digitaloceanspaces.com') ||
                host.endsWith('.cloudfront.net')
            ) {
                return true;
            }

            // Local development hosts
            if (process.env.NODE_ENV !== 'production' && (host === 'localhost' || host === '127.0.0.1')) {
                return true;
            }

            return false;
        } catch {
            return false;
        }
    }

    /**
     * Get the full URL for a file from AI base URL
     */
    private getFullFileUrl(fileUrl: string): string {
        // If it's already a full URL, return it as-is
        if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
            return fileUrl;
        }

        // If it starts with /api/v1/admin/kb/, it's a path to the file
        if (fileUrl.startsWith('/api/v1/admin/kb/')) {
            return `${AI_BASE_URL}${fileUrl}`;
        }

        // If it starts with /storage or /public/storage
        if (fileUrl.startsWith('/storage') || fileUrl.startsWith('/public/storage')) {
            return `${AI_BASE_URL}${fileUrl}`;
        }

        // If it's just a relative path, prepend the AI base URL
        const cleanUrl = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
        return `${AI_BASE_URL}${cleanUrl}`;
    }

    /**
     * Download a file directly from its URL
     */
    public async downloadFile(options: DownloadOptions): Promise<ExportResult> {
        try {
            const { fileUrl, fileName, fileExtension } = options;

            if (!fileUrl) {
                return {
                    success: false,
                    message: 'No file URL provided',
                };
            }

            if (!this.isAllowedDownloadHost(fileUrl)) {
                return {
                    success: false,
                    message: 'Download blocked: File host is not in the allowed domain list.',
                };
            }

            const fullUrl = this.getFullFileUrl(fileUrl);
            const safeFileName = (fileName || 'export').replace(/[^a-zA-Z0-9_-]/g, '_');

            // Clean extension: strip query parameters, hash fragments, and leading dots
            let cleanExt = (fileExtension || '').split('?')[0].split('#')[0].replace(/^\./, '').toLowerCase();
            if (!cleanExt && fileUrl) {
                const urlPath = fileUrl.split('?')[0].split('#')[0];
                const derived = urlPath.split('.').pop()?.toLowerCase();
                if (derived && derived.length <= 5) {
                    cleanExt = derived;
                }
            }
            cleanExt = cleanExt || 'dat';

            // Fetch the file from server (no Content-Type on GET to prevent unnecessary CORS OPTIONS preflight)
            const response = await apiFetch(fullUrl, {
                method: 'GET',
            });

            if (!response.ok) {
                return {
                    success: false,
                    message: `Failed to download file: ${response.status} ${response.statusText || 'Error'}`,
                };
            }

            const blob = await response.blob();

            // Determine the correct MIME type based on extension
            const mimeTypes: Record<string, string> = {
                'pdf': 'application/pdf',
                'doc': 'application/msword',
                'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'txt': 'text/plain',
                'csv': 'text/csv',
                'xls': 'application/vnd.ms-excel',
                'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'png': 'image/png',
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'gif': 'image/gif',
                'webp': 'image/webp',
                'svg': 'image/svg+xml',
                'zip': 'application/zip',
                'rar': 'application/x-rar-compressed',
                '7z': 'application/x-7z-compressed',
                'json': 'application/json',
                'xml': 'application/xml',
            };

            const mimeType = mimeTypes[cleanExt] || 'application/octet-stream';

            // Create a blob with the correct MIME type
            const downloadBlob = new Blob([blob], { type: mimeType });

            // Save the file with the proper extension
            saveAs(downloadBlob, `${safeFileName}.${cleanExt}`);

            return {
                success: true,
                message: `File downloaded successfully as ${cleanExt.toUpperCase()}`,
            };
        } catch (error) {
            console.error('Download error:', error);
            // A-H5 Fallback: Cross-origin storage reads may be blocked by CORS in the browser.
            // Trigger direct browser navigation/download so the storage URL can be fetched directly.
            if (typeof window !== 'undefined' && options.fileUrl) {
                try {
                    const fullUrl = this.getFullFileUrl(options.fileUrl);
                    const link = document.createElement('a');
                    link.href = fullUrl;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    const ext = options.fileExtension.startsWith('.') ? options.fileExtension : `.${options.fileExtension}`;
                    link.download = `${options.fileName}${ext}`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    return {
                        success: true,
                        message: `File download initiated as ${options.fileExtension.toUpperCase()}`,
                    };
                } catch {}
            }
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to download file',
            };
        }
    }

    /**
     * Get supported file types for download
     */
    public getSupportedFileTypes(): { extension: string; label: string; mimeType: string }[] {
        return [
            { extension: 'pdf', label: 'PDF Document', mimeType: 'application/pdf' },
            { extension: 'doc', label: 'Word Document', mimeType: 'application/msword' },
            { extension: 'docx', label: 'Word Document', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
            { extension: 'txt', label: 'Text File', mimeType: 'text/plain' },
            { extension: 'csv', label: 'CSV File', mimeType: 'text/csv' },
            { extension: 'xls', label: 'Excel Spreadsheet', mimeType: 'application/vnd.ms-excel' },
            { extension: 'xlsx', label: 'Excel Spreadsheet', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
        ];
    }
}

// Singleton instance
const fileExportService = FileExportService.getInstance();

// Export the service functions
export const downloadFile = (options: DownloadOptions) => fileExportService.downloadFile(options);
export const getSupportedFileTypes = () => fileExportService.getSupportedFileTypes();
