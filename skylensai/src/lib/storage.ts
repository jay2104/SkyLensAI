/**
 * File Storage Utilities
 * Handles file upload, download, and management with Supabase Storage
 */

import { supabase, supabaseAdmin, STORAGE_CONFIG } from './supabase';
import type { LogFileType } from '@prisma/client';

/**
 * File signature validation result
 */
interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Known file signatures (magic numbers) for drone log files
 */
const FILE_SIGNATURES = {
  '.bin': [
    [0x41, 0x52, 0x44, 0x55], // "ARDU" - ArduPilot BIN format
    [0xA3, 0x95, 0x80, 0x80], // Alternative ArduPilot header
    [0xFE], // MAVLink v1.0 message start
    [0xFD], // MAVLink v2.0 message start
  ],
  '.ulg': [
    [0x55, 0x4C, 0x6F, 0x67], // "ULog" - PX4 ULog format header
  ],
  '.tlog': [
    [0xFE], // MAVLink v1.0 message start
    [0xFD], // MAVLink v2.0 message start
  ],
  '.log': [
    // LOG files are text-based, check for common ArduPilot log patterns
    // We'll validate these contain readable text with expected patterns
  ]
} as const;

/**
 * Validate file content against known drone log file signatures
 */
async function validateFileContent(file: File, fileExtension: string): Promise<FileValidationResult> {
  try {
    // Read first 1024 bytes for signature validation
    const chunk = file.slice(0, 1024);
    const arrayBuffer = await chunk.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Special handling for text-based LOG files
    if (fileExtension === '.log') {
      return validateTextLogFile(bytes);
    }

    // Validate binary file signatures
    const signatures = FILE_SIGNATURES[fileExtension as keyof typeof FILE_SIGNATURES];
    if (!signatures) {
      return {
        isValid: false,
        error: `No validation rules defined for ${fileExtension} files`,
      };
    }

    // Check if file starts with any of the known signatures
    for (const signature of signatures) {
      if (bytesStartWith(bytes, signature)) {
        return { isValid: true };
      }
    }

    return {
      isValid: false,
      error: `File does not contain a valid ${fileExtension.toUpperCase()} signature. This may not be a genuine drone log file.`,
    };

  } catch (error) {
    return {
      isValid: false,
      error: `Content validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Validate text-based LOG files
 */
function validateTextLogFile(bytes: Uint8Array): FileValidationResult {
  try {
    // Convert first 512 bytes to text
    const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes.slice(0, 512));
    
    // Check for common ArduPilot LOG file patterns
    const logPatterns = [
      /FMT,/,           // Format messages
      /PARM,/,          // Parameter messages  
      /MSG,/,           // Text messages
      /IMU,/,           // IMU data
      /GPS,/,           // GPS data
      /BATT,/,          // Battery data
      /MODE,/,          // Flight mode changes
      /ArduCopter/i,    // ArduCopter identification
      /ArduPlane/i,     // ArduPlane identification
      /PX4/i,           // PX4 identification
      /\d+,\d+,/,       // Timestamp pattern
    ];

    // File should contain at least one expected pattern
    const hasValidPattern = logPatterns.some(pattern => pattern.test(text));
    
    if (!hasValidPattern) {
      return {
        isValid: false,
        error: 'LOG file does not contain expected drone telemetry patterns. This may not be a genuine flight log.',
      };
    }

    // Check if file appears to be readable text (not binary data disguised as .log)
    const nonPrintableCount = Array.from(bytes.slice(0, 256)).filter(byte => 
      byte < 32 && byte !== 9 && byte !== 10 && byte !== 13 // Allow tab, LF, CR
    ).length;
    
    if (nonPrintableCount > 50) { // Allow some non-printable chars but not too many
      return {
        isValid: false,
        error: 'LOG file contains too many non-printable characters. This appears to be binary data, not a text log.',
      };
    }

    return { isValid: true };

  } catch (error) {
    return {
      isValid: false,
      error: `LOG file validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Check if byte array starts with a specific signature
 */
function bytesStartWith(bytes: Uint8Array, signature: readonly number[]): boolean {
  if (bytes.length < signature.length) {
    return false;
  }
  
  for (let i = 0; i < signature.length; i++) {
    if (bytes[i] !== signature[i]) {
      return false;
    }
  }
  
  return true;
}

export interface FileUploadOptions {
  userId: string;
  file: File;
  onProgress?: (progress: number) => void;
}

export interface FileUploadResult {
  success: boolean;
  fileId?: string;
  filePath?: string;
  error?: string;
}

/**
 * Upload a log file to Supabase Storage
 */
export async function uploadLogFile({
  userId,
  file,
  onProgress,
}: FileUploadOptions): Promise<FileUploadResult> {
  try {
    // Validate file size
    if (file.size > STORAGE_CONFIG.MAX_FILE_SIZE) {
      return {
        success: false,
        error: `File size exceeds maximum limit of ${STORAGE_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`,
      };
    }

    // Validate file type
    const fileExtension = getFileExtension(file.name);
    if (!STORAGE_CONFIG.ALLOWED_FILE_TYPES.includes(fileExtension as any)) {
      return {
        success: false,
        error: `File type ${fileExtension} is not supported. Allowed types: ${STORAGE_CONFIG.ALLOWED_FILE_TYPES.join(', ')}`,
      };
    }

    // Validate file content using magic numbers (file signatures)
    const contentValidation = await validateFileContent(file, fileExtension);
    if (!contentValidation.isValid) {
      return {
        success: false,
        error: contentValidation.error || 'File content validation failed',
      };
    }

    // Generate unique file path
    const timestamp = Date.now();
    const sanitizedFileName = sanitizeFileName(file.name);
    const filePath = `${userId}/${timestamp}-${sanitizedFileName}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      return {
        success: false,
        error: `Upload failed: ${error.message}`,
      };
    }

    return {
      success: true,
      fileId: data.id,
      filePath: data.path,
    };
  } catch (error) {
    return {
      success: false,
      error: `Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Get a signed URL for downloading a file
 */
export async function getFileDownloadUrl(
  filePath: string,
  expiresIn: number = 3600
): Promise<{ url?: string; error?: string }> {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      return { error: `Failed to generate download URL: ${error.message}` };
    }

    return { url: data.signedUrl };
  } catch (error) {
    return {
      error: `Download URL error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Delete a file from storage
 */
export async function deleteLogFile(filePath: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      return {
        success: false,
        error: `Failed to delete file: ${error.message}`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `Delete error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * List files for a specific user with pagination
 */
export async function listUserFiles(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ files?: any[]; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .list(userId, {
        limit,
        offset,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      return { error: `Failed to list files: ${error.message}` };
    }

    return { files: data };
  } catch (error) {
    return {
      error: `List files error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Get file extension from filename
 */
function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex !== -1 ? filename.substring(lastDotIndex).toLowerCase() : '';
}

/**
 * Sanitize filename for safe storage
 */
function sanitizeFileName(filename: string): string {
  // Remove or replace unsafe characters
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 100); // Limit length
}

/**
 * Map file extension to LogFileType enum
 */
export function getLogFileType(filename: string): LogFileType {
  const extension = getFileExtension(filename);
  
  switch (extension) {
    case '.bin':
      return 'BIN';
    case '.log':
      return 'LOG';
    case '.tlog':
      return 'TLOG';
    case '.ulg':
      return 'ULG';
    default:
      return 'BIN'; // Default fallback
  }
}

/**
 * Get storage usage for a user
 */
export async function getUserStorageUsage(userId: string): Promise<{
  totalSize?: number;
  fileCount?: number;
  error?: string;
}> {
  try {
    const { files, error } = await listUserFiles(userId, 1000); // Get all files
    
    if (error) {
      return { error };
    }

    if (!files) {
      return { totalSize: 0, fileCount: 0 };
    }

    const totalSize = files.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);
    
    return {
      totalSize,
      fileCount: files.length,
    };
  } catch (error) {
    return {
      error: `Storage usage error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}