import { describe, it, expect } from 'vitest';
import {
    validateFile,
    validateImageFile,
    validateAvatarFile,
    validateAttachmentFile,
    validateLeadAttachmentFile,
    validateKnowledgeFile,
    MAX_IMAGE_SIZE_BYTES,
    MAX_AVATAR_SIZE_BYTES,
    MAX_LEAD_ATTACHMENT_SIZE_BYTES,
    MAX_KNOWLEDGE_FILE_SIZE_BYTES,
} from './file-validation';

function createMockFile(name: string, size: number, type: string): File {
    return {
        name,
        size,
        type,
        slice: () => new Blob(),
        arrayBuffer: async () => new ArrayBuffer(0),
        text: async () => '',
        stream: () => new ReadableStream(),
        lastModified: Date.now(),
    } as unknown as File;
}

describe('file-validation (VAL-004)', () => {
    describe('validateFile', () => {
        it('returns false when file is null or undefined', () => {
            expect(validateFile(null as unknown as File).isValid).toBe(false);
        });
    });

    describe('validateImageFile', () => {
        it('accepts valid PNG, JPEG, and WebP files under 10MB', () => {
            const png = createMockFile('photo.png', 2 * 1024 * 1024, 'image/png');
            const jpg = createMockFile('banner.jpg', 5 * 1024 * 1024, 'image/jpeg');
            const webp = createMockFile('graphic.webp', 1 * 1024 * 1024, 'image/webp');

            expect(validateImageFile(png).isValid).toBe(true);
            expect(validateImageFile(jpg).isValid).toBe(true);
            expect(validateImageFile(webp).isValid).toBe(true);
        });

        it('strictly rejects SVG files by mime type or extension', () => {
            const svgMime = createMockFile('vector.svg', 1024, 'image/svg+xml');
            const svgNameOnly = createMockFile('evil.svg', 1024, '');

            const res1 = validateImageFile(svgMime);
            expect(res1.isValid).toBe(false);
            expect(res1.error).toContain('SVG files are not permitted');

            const res2 = validateImageFile(svgNameOnly);
            expect(res2.isValid).toBe(false);
            expect(res2.error).toContain('SVG files are not permitted');
        });

        it('rejects files exceeding 10MB limit', () => {
            const largeFile = createMockFile('large.jpg', MAX_IMAGE_SIZE_BYTES + 1, 'image/jpeg');
            const res = validateImageFile(largeFile);

            expect(res.isValid).toBe(false);
            expect(res.error).toContain('exceeds 10MB limit');
        });

        it('rejects unpermitted file extensions and MIME types', () => {
            const executable = createMockFile('script.exe', 1024, 'application/x-msdownload');
            const html = createMockFile('page.html', 1024, 'text/html');

            expect(validateImageFile(executable).isValid).toBe(false);
            expect(validateImageFile(html).isValid).toBe(false);
        });
    });

    describe('validateAvatarFile', () => {
        it('enforces 5MB limit for avatars', () => {
            const okAvatar = createMockFile('avatar.png', 4 * 1024 * 1024, 'image/png');
            const bigAvatar = createMockFile('avatar.png', MAX_AVATAR_SIZE_BYTES + 1, 'image/png');

            expect(validateAvatarFile(okAvatar).isValid).toBe(true);
            const res = validateAvatarFile(bigAvatar);
            expect(res.isValid).toBe(false);
            expect(res.error).toContain('exceeds 5MB limit');
        });
    });

    describe('validateAttachmentFile', () => {
        it('allows PDF and documents in addition to safe images', () => {
            const pdf = createMockFile('contract.pdf', 3 * 1024 * 1024, 'application/pdf');
            const docx = createMockFile('notes.docx', 1 * 1024 * 1024, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            const xlsx = createMockFile('data.xlsx', 1 * 1024 * 1024, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            const png = createMockFile('photo.png', 2 * 1024 * 1024, 'image/png');

            expect(validateAttachmentFile(pdf).isValid).toBe(true);
            expect(validateAttachmentFile(docx).isValid).toBe(true);
            expect(validateAttachmentFile(xlsx).isValid).toBe(true);
            expect(validateAttachmentFile(png).isValid).toBe(true);
        });

        it('rejects SVGs and executables in attachments', () => {
            const svg = createMockFile('diagram.svg', 1024, 'image/svg+xml');
            const exe = createMockFile('installer.exe', 1024, 'application/octet-stream');

            expect(validateAttachmentFile(svg).isValid).toBe(false);
            expect(validateAttachmentFile(exe).isValid).toBe(false);
        });
    });

    describe('validateLeadAttachmentFile (Finding A-19)', () => {
        it('allows PDF and safe images up to 25MB limit', () => {
            const pdf = createMockFile('document.pdf', 20 * 1024 * 1024, 'application/pdf');
            const png = createMockFile('photo.png', 15 * 1024 * 1024, 'image/png');
            const jpg = createMockFile('scan.jpg', 24 * 1024 * 1024, 'image/jpeg');

            expect(validateLeadAttachmentFile(pdf).isValid).toBe(true);
            expect(validateLeadAttachmentFile(png).isValid).toBe(true);
            expect(validateLeadAttachmentFile(jpg).isValid).toBe(true);
        });

        it('refuses office files (DOCX, XLSX) as required by server rules', () => {
            const docx = createMockFile('notes.docx', 1 * 1024 * 1024, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            const xlsx = createMockFile('data.xlsx', 1 * 1024 * 1024, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            const doc = createMockFile('old.doc', 500 * 1024, 'application/msword');

            const resDocx = validateLeadAttachmentFile(docx);
            expect(resDocx.isValid).toBe(false);
            expect(resDocx.error).toContain('Unsupported file format');

            const resXlsx = validateLeadAttachmentFile(xlsx);
            expect(resXlsx.isValid).toBe(false);
            expect(resXlsx.error).toContain('Unsupported file format');

            const resDoc = validateLeadAttachmentFile(doc);
            expect(resDoc.isValid).toBe(false);
            expect(resDoc.error).toContain('Unsupported file format');
        });

        it('rejects files exceeding server 25MB limit', () => {
            const oversized = createMockFile('huge.pdf', MAX_LEAD_ATTACHMENT_SIZE_BYTES + 1, 'application/pdf');
            const res = validateLeadAttachmentFile(oversized);

            expect(res.isValid).toBe(false);
            expect(res.error).toContain('exceeds 25MB limit');
        });

        it('strictly rejects SVG files for security', () => {
            const svg = createMockFile('vector.svg', 1024, 'image/svg+xml');
            const res = validateLeadAttachmentFile(svg);

            expect(res.isValid).toBe(false);
            expect(res.error).toContain('SVG files are not permitted');
        });
    });

    describe('validateKnowledgeFile (Finding A-19)', () => {
        it('allows PDF, Word, Text, CSV, and Excel documents up to 10MB', () => {
            const pdf = createMockFile('manual.pdf', 8 * 1024 * 1024, 'application/pdf');
            const docx = createMockFile('guide.docx', 5 * 1024 * 1024, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            const txt = createMockFile('faq.txt', 100 * 1024, 'text/plain');
            const csv = createMockFile('data.csv', 2 * 1024 * 1024, 'text/csv');
            const xlsx = createMockFile('sheet.xlsx', 4 * 1024 * 1024, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

            expect(validateKnowledgeFile(pdf).isValid).toBe(true);
            expect(validateKnowledgeFile(docx).isValid).toBe(true);
            expect(validateKnowledgeFile(txt).isValid).toBe(true);
            expect(validateKnowledgeFile(csv).isValid).toBe(true);
            expect(validateKnowledgeFile(xlsx).isValid).toBe(true);
        });

        it('rejects knowledge files exceeding Django server 10MB limit (fixing former 100MB loophole)', () => {
            const oversized = createMockFile('huge-manual.pdf', MAX_KNOWLEDGE_FILE_SIZE_BYTES + 1, 'application/pdf');
            const res = validateKnowledgeFile(oversized);

            expect(res.isValid).toBe(false);
            expect(res.error).toContain('exceeds 10MB limit');
        });

        it('strictly rejects executable files and SVGs', () => {
            const exe = createMockFile('setup.exe', 1024, 'application/octet-stream');
            const svg = createMockFile('logo.svg', 1024, 'image/svg+xml');

            expect(validateKnowledgeFile(exe).isValid).toBe(false);
            expect(validateKnowledgeFile(svg).isValid).toBe(false);
        });
    });
});
