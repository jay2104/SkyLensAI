/**
 * Storage Utilities Tests
 * Tests for file upload, download, and management functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadLogFile, getFileDownloadUrl, deleteLogFile, getLogFileType } from './storage';

// Mock Supabase client
vi.mock('./supabase', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        createSignedUrl: vi.fn(),
      })),
    },
  },
  supabaseAdmin: {
    storage: {
      from: vi.fn(() => ({
        remove: vi.fn(),
        list: vi.fn(),
      })),
    },
  },
  STORAGE_CONFIG: {
    BUCKET_NAME: 'log-files',
    MAX_FILE_SIZE: 100 * 1024 * 1024,
    ALLOWED_FILE_TYPES: ['.bin', '.log', '.tlog', '.ulg'],
    UPLOAD_TIMEOUT: 60000,
  },
}));

describe('Storage Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getLogFileType', () => {
    it('should return correct LogFileType for .bin files', () => {
      expect(getLogFileType('flight-data.bin')).toBe('BIN');
    });

    it('should return correct LogFileType for .log files', () => {
      expect(getLogFileType('system.log')).toBe('LOG');
    });

    it('should return correct LogFileType for .tlog files', () => {
      expect(getLogFileType('telemetry.tlog')).toBe('TLOG');
    });

    it('should return correct LogFileType for .ulg files', () => {
      expect(getLogFileType('px4-log.ulg')).toBe('ULG');
    });

    it('should return BIN as default for unknown extensions', () => {
      expect(getLogFileType('unknown.xyz')).toBe('BIN');
    });

    it('should handle files without extensions', () => {
      expect(getLogFileType('filename')).toBe('BIN');
    });
  });

  describe('uploadLogFile', () => {
    it('should reject files that are too large', async () => {
      const largeFile = new File(['x'.repeat(101 * 1024 * 1024)], 'large.bin', {
        type: 'application/octet-stream',
      });

      const result = await uploadLogFile({
        userId: 'test-user',
        file: largeFile,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('File size exceeds maximum limit');
    });

    it('should reject unsupported file types', async () => {
      const unsupportedFile = new File(['test'], 'test.txt', {
        type: 'text/plain',
      });

      const result = await uploadLogFile({
        userId: 'test-user',
        file: unsupportedFile,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('File type .txt is not supported');
    });

    it('should accept valid file types', async () => {
      // Create a mock file with proper File interface methods
      const validFile = {
        name: 'test.bin',
        size: 1000,
        type: 'application/octet-stream',
        slice: vi.fn().mockReturnValue({
          arrayBuffer: vi.fn().mockResolvedValue(
            // Mock valid ArduPilot BIN signature (ARDU)
            new Uint8Array([0x41, 0x52, 0x44, 0x55, ...Array(1020).fill(0)]).buffer
          )
        })
      } as unknown as File;

      // Mock successful upload
      const { supabase } = await import('./supabase');
      const mockUpload = vi.fn().mockResolvedValue({
        data: { id: 'file-id', path: 'user/timestamp-test.bin' },
        error: null,
      });
      
      vi.mocked(supabase.storage.from).mockReturnValue({
        upload: mockUpload,
      } as any);

      const result = await uploadLogFile({
        userId: 'test-user',
        file: validFile,
      });

      expect(result.success).toBe(true);
      expect(result.fileId).toBe('file-id');
      expect(result.filePath).toBe('user/timestamp-test.bin');
    });
  });

  describe('getFileDownloadUrl', () => {
    it('should generate signed URL successfully', async () => {
      const { supabase } = await import('./supabase');
      const mockCreateSignedUrl = vi.fn().mockResolvedValue({
        data: { signedUrl: 'https://example.com/signed-url' },
        error: null,
      });

      vi.mocked(supabase.storage.from).mockReturnValue({
        createSignedUrl: mockCreateSignedUrl,
      } as any);

      const result = await getFileDownloadUrl('test/file.bin');

      expect(result.url).toBe('https://example.com/signed-url');
      expect(result.error).toBeUndefined();
    });

    it('should handle errors when generating signed URL', async () => {
      const { supabase } = await import('./supabase');
      const mockCreateSignedUrl = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'File not found' },
      });

      vi.mocked(supabase.storage.from).mockReturnValue({
        createSignedUrl: mockCreateSignedUrl,
      } as any);

      const result = await getFileDownloadUrl('nonexistent/file.bin');

      expect(result.url).toBeUndefined();
      expect(result.error).toContain('Failed to generate download URL');
    });
  });

  describe('deleteLogFile', () => {
    it('should delete file successfully', async () => {
      const { supabaseAdmin } = await import('./supabase');
      const mockRemove = vi.fn().mockResolvedValue({
        error: null,
      });

      vi.mocked(supabaseAdmin.storage.from).mockReturnValue({
        remove: mockRemove,
      } as any);

      const result = await deleteLogFile('test/file.bin');

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(mockRemove).toHaveBeenCalledWith(['test/file.bin']);
    });

    it('should handle delete errors', async () => {
      const { supabaseAdmin } = await import('./supabase');
      const mockRemove = vi.fn().mockResolvedValue({
        error: { message: 'Permission denied' },
      });

      vi.mocked(supabaseAdmin.storage.from).mockReturnValue({
        remove: mockRemove,
      } as any);

      const result = await deleteLogFile('test/file.bin');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to delete file');
    });
  });
});