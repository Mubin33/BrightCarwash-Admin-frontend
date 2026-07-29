import { saveAs } from 'file-saver';

export type ExportFormat = 'excel' | 'csv' | 'txt' | 'pdf' | 'word';

export interface ExportOptions {
    fileName?: string;
    sheetName?: string;
    headers?: string[];
    data: any[];
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
    data?: any;
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

            const fullUrl = this.getFullFileUrl(fileUrl);
            const safeFileName = fileName.replace(/[^a-zA-Z0-9]/g, '_');

            // Fetch the file from AI server
            const response = await fetch(fullUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/octet-stream',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
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

            const mimeType = mimeTypes[fileExtension.toLowerCase()] || 'application/octet-stream';

            // Create a blob with the correct MIME type
            const downloadBlob = new Blob([blob], { type: mimeType });

            // Save the file with the proper extension
            const extension = fileExtension.startsWith('.') ? fileExtension : `.${fileExtension}`;
            saveAs(downloadBlob, `${safeFileName}${extension}`);

            return {
                success: true,
                message: `File downloaded successfully as ${fileExtension.toUpperCase()}`,
            };
        } catch (error) {
            console.error('Download error:', error);
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