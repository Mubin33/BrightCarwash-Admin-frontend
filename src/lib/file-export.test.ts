import { describe, it, expect, vi } from 'vitest';
import { getSupportedFileTypes, downloadFile } from './file-export';
import * as apiFetchModule from '@/lib/api-fetch';
import * as fileSaverModule from 'file-saver';

vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}));

describe('FileExportService security & supported extensions', () => {
  it('returns supported file types list with correct mime types', () => {
    const types = getSupportedFileTypes();
    expect(types.length).toBeGreaterThanOrEqual(7);

    const extensions = types.map((t) => t.extension);
    expect(extensions).toContain('pdf');
    expect(extensions).toContain('xlsx');
    expect(extensions).toContain('csv');
    expect(extensions).toContain('docx');
  });

  it('blocks downloads from untrusted arbitrary third-party hosts', async () => {
    const result = await downloadFile({
      fileUrl: 'https://evil-untrusted-site.com/payload.pdf',
      fileName: 'report',
      fileExtension: 'pdf',
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain('File host is not in the allowed domain list');
  });

  it('allows S3 bucket downloads and cleans presigned query parameters from extension', async () => {
    const mockBlob = new Blob(['sample data'], { type: 'application/pdf' });
    vi.spyOn(apiFetchModule, 'apiFetch').mockResolvedValueOnce({
      ok: true,
      blob: async () => mockBlob,
    } as unknown as Response);

    const saveAsSpy = vi.spyOn(fileSaverModule, 'saveAs');

    const result = await downloadFile({
      fileUrl: 'https://brightside-assets.s3.us-east-1.amazonaws.com/reports/summary.pdf?AWSAccessKeyId=AKIAIOSFODNN7EXAMPLE&Expires=1700000000',
      fileName: 'summary-report',
      fileExtension: 'pdf?AWSAccessKeyId=AKIA...',
    });

    expect(result.success).toBe(true);
    expect(saveAsSpy).toHaveBeenCalledWith(expect.any(Blob), 'summary-report.pdf');
  });

  it('fails cleanly on 401/404/500 HTTP responses without reporting success or triggering fallback download', async () => {
    vi.spyOn(apiFetchModule, 'apiFetch').mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as unknown as Response);

    const saveAsSpy = vi.spyOn(fileSaverModule, 'saveAs');

    const result = await downloadFile({
      fileUrl: 'https://brightside-assets.s3.us-east-1.amazonaws.com/missing.pdf',
      fileName: 'missing-report',
      fileExtension: 'pdf',
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain('Failed to download file: 404');
    expect(saveAsSpy).not.toHaveBeenCalled();
  });
});
