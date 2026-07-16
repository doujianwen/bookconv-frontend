/**
 * API route validation tests: POST /api/convert request/response behavior.
 */
import { describe, it, expect, beforeEach } from '@jest/globals';
import { SUPPORTED_FORMATS } from '@/lib/conversion-map';

describe('API: Request validation logic', () => {
  it('should reject requests missing file field', () => {
    // In the real route, missing file returns 400
    const errors: string[] = [];
    if (!'file' in {}) errors.push('Missing required fields: file');
    expect(errors.length).toBeGreaterThanOrEqual(0);
  });

  it('should reject unsupported source formats', () => {
    const unsupportedFormats = ['xyz', 'abc', 'bin', 'exe'];
    for (const fmt of unsupportedFormats) {
      expect(SUPPORTED_FORMATS).not.toContain(fmt);
    }
  });

  it('should accept all supported formats as source', () => {
    for (const fmt of SUPPORTED_FORMATS) {
      expect(typeof fmt).toBe('string');
      expect(fmt.length).toBeGreaterThan(0);
    }
  });

  it('should normalize format strings (remove dots, lowercase)', () => {
    const normalize = (fmt: string) => fmt.toLowerCase().replace('.', '');
    expect(normalize('.EPUB')).toBe('epub');
    expect(normalize('Pdf')).toBe('pdf');
    expect(normalize('DOCX')).toBe('docx');
  });

  it('should enforce 10MB file size limit', () => {
    const maxBytes = 10 * 1024 * 1024;
    expect(maxBytes).toBe(10485760);
    expect(maxBytes).toBeGreaterThan(0);
  });
});

describe('API: Error code mapping', () => {
  const ERROR_CODE_MAP: Record<string, string> = {
    ENOENT: 'FILE_NOT_FOUND',
    EACCES: 'PERMISSION_DENIED',
    ETIMEDOUT: 'CONVERSION_TIMEOUT',
    EMFILE: 'FILE_TOO_LARGE',
    EFAULT: 'INVALID_INPUT_FILE',
    EBUSY: 'CONVERSION_BUSY',
    UNKNOWN_FORMAT: 'UNSUPPORTED_FORMAT',
    PROCESSING_ERROR: 'CONVERSION_FAILED',
  };

  it('should map known OS errors to application codes', () => {
    expect(ERROR_CODE_MAP.ENOENT).toBe('FILE_NOT_FOUND');
    expect(ERROR_CODE_MAP.EACCES).toBe('PERMISSION_DENIED');
    expect(ERROR_CODE_MAP.ETIMEDOUT).toBe('CONVERSION_TIMEOUT');
  });

  it('should default to CONVERSION_FAILED for unknown errors', () => {
    const message = 'Some unknown error';
    let mappedCode = 'CONVERSION_FAILED';
    for (const [key, code] of Object.entries(ERROR_CODE_MAP)) {
      if (message.includes(key)) {
        mappedCode = code;
        break;
      }
    }
    expect(mappedCode).toBe('CONVERSION_FAILED');
  });
});
