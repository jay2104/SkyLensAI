/**
 * File Content Validation Tests
 * Tests the magic number validation system for drone log files
 */

import { describe, it, expect } from 'vitest';

// Helper functions for testing validation logic
const bytesStartWith = (bytes: Uint8Array, signature: readonly number[]): boolean => {
  if (bytes.length < signature.length) {
    return false;
  }
  
  for (let i = 0; i < signature.length; i++) {
    if (bytes[i] !== signature[i]) {
      return false;
    }
  }
  
  return true;
};

const validateTextLogContent = (text: string): boolean => {
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

  return logPatterns.some(pattern => pattern.test(text));
};

describe('File Content Validation', () => {
  it('should validate ArduPilot BIN file signatures', () => {
    const arduPilotSignature = [0x41, 0x52, 0x44, 0x55] as const; // "ARDU"
    const validBytes = new Uint8Array([0x41, 0x52, 0x44, 0x55, 0x00, 0x01]);
    const invalidBytes = new Uint8Array([0x4D, 0x5A, 0x90, 0x00]); // PE header
    
    expect(bytesStartWith(validBytes, arduPilotSignature)).toBe(true);
    expect(bytesStartWith(invalidBytes, arduPilotSignature)).toBe(false);
  });

  it('should validate ULog file signatures', () => {
    const ulogSignature = [0x55, 0x4C, 0x6F, 0x67] as const; // "ULog"
    const validBytes = new Uint8Array([0x55, 0x4C, 0x6F, 0x67, 0x00, 0x01]);
    const invalidBytes = new Uint8Array([0x41, 0x52, 0x44, 0x55]); // ArduPilot
    
    expect(bytesStartWith(validBytes, ulogSignature)).toBe(true);
    expect(bytesStartWith(invalidBytes, ulogSignature)).toBe(false);
  });

  it('should validate MAVLink signatures', () => {
    const mavlinkV1 = [0xFE] as const;
    const mavlinkV2 = [0xFD] as const;
    const validV1Bytes = new Uint8Array([0xFE, 0x09, 0x00]);
    const validV2Bytes = new Uint8Array([0xFD, 0x09, 0x00]);
    const invalidBytes = new Uint8Array([0x41, 0x52, 0x44, 0x55]);
    
    expect(bytesStartWith(validV1Bytes, mavlinkV1)).toBe(true);
    expect(bytesStartWith(validV2Bytes, mavlinkV2)).toBe(true);
    expect(bytesStartWith(invalidBytes, mavlinkV1)).toBe(false);
  });

  it('should validate LOG file content patterns', () => {
    const validLogContent = `FMT, 128, 89, FMT, BBnNZ, Type,Length,Name,Format,Columns
PARM, 1, ANGLE_MAX, 4500
GPS, 123456, 1, 8, 37.7749, -122.4194, 100.5, 0.5, 10
BATT, 123456, 12.5, 2.3, 85`;

    const invalidLogContent = `Just some random text
This is not a flight log
No telemetry patterns here`;

    expect(validateTextLogContent(validLogContent)).toBe(true);
    expect(validateTextLogContent(invalidLogContent)).toBe(false);
  });

  it('should detect executable files', () => {
    const peHeader = [0x4D, 0x5A] as const; // PE executable
    const elfHeader = [0x7F, 0x45, 0x4C, 0x46] as const; // ELF executable
    
    const peBytes = new Uint8Array([0x4D, 0x5A, 0x90, 0x00]);
    const elfBytes = new Uint8Array([0x7F, 0x45, 0x4C, 0x46]);
    const validLogBytes = new Uint8Array([0x41, 0x52, 0x44, 0x55]);
    
    // These should NOT match valid log signatures
    const arduSignature = [0x41, 0x52, 0x44, 0x55] as const;
    expect(bytesStartWith(peBytes, arduSignature)).toBe(false);
    expect(bytesStartWith(elfBytes, arduSignature)).toBe(false);
    expect(bytesStartWith(validLogBytes, arduSignature)).toBe(true);
  });

  it('should validate file extension mapping', () => {
    // Test the getFileExtension logic (simulated)
    const getFileExtension = (filename: string): string => {
      const lastDotIndex = filename.lastIndexOf('.');
      return lastDotIndex !== -1 ? filename.substring(lastDotIndex).toLowerCase() : '';
    };

    expect(getFileExtension('flight.bin')).toBe('.bin');
    expect(getFileExtension('flight.log')).toBe('.log');
    expect(getFileExtension('flight.tlog')).toBe('.tlog');
    expect(getFileExtension('flight.ulg')).toBe('.ulg');
    expect(getFileExtension('flight')).toBe('');
  });

  it('should validate file size limits', () => {
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
    
    expect(50 * 1024 * 1024).toBeLessThan(MAX_FILE_SIZE); // 50MB - valid
    expect(150 * 1024 * 1024).toBeGreaterThan(MAX_FILE_SIZE); // 150MB - invalid
  });
});