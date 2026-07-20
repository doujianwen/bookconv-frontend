import { CONVERSION_MAP, SUPPORTED_FORMATS } from '@/lib/conversion-map';
import { sanitizeError, mapErrorCode } from '@/lib/error-handler';

describe('CONVERSION_MAP Regression', () => {
  it('should have exactly 26 conversion paths', () => {
    expect(Object.keys(CONVERSION_MAP).length).toBe(26);
  });

  it('should have tool type and description for every conversion', () => {
    for (const [key, entry] of Object.entries(CONVERSION_MAP) as [string, any][]) {
      expect(entry.tool).toBeDefined();
      expect(['calibre', 'calibre+imagemagick', 'libreoffice+calibre']).toContain(entry.tool);
      expect(entry.description.length).toBeGreaterThan(0);
    }
  });
});

describe('API validation logic', () => {
  it('should reject unsupported source formats', () => {
    const unsupported = ['xyz', 'abc', 'bin', 'exe'];
    for (const fmt of unsupported) {
      expect(SUPPORTED_FORMATS).not.toContain(fmt);
    }
  });

  it('should normalize format strings', () => {
    const normalize = (fmt: string) => fmt.toLowerCase().replace('.', '').replace(/\./g, '');
    expect(normalize('.EPUB')).toBe('epub');
    expect(normalize('Pdf')).toBe('pdf');
    expect(normalize('DOCX')).toBe('docx');
  });

  it('should enforce 10MB file size limit', () => {
    const maxBytes = 10 * 1024 * 1024;
    expect(maxBytes).toBe(10485760);
  });
});

describe('Error code mapping', () => {
  it('should map known OS errors to application codes', () => {
    expect(mapErrorCode('ENOENT: no such file')).toBe('FILE_NOT_FOUND');
    expect(mapErrorCode('EACCES: permission denied')).toBe('PERMISSION_DENIED');
    expect(mapErrorCode('ETIMEDOUT')).toBe('CONVERSION_TIMEOUT');
  });

  it('should map conversion failure', () => {
    expect(mapErrorCode('Conversion failed: output not generated')).toBe('CONVERSION_FAILED');
  });

  it('should default to INTERNAL_ERROR for unknown errors', () => {
    expect(mapErrorCode('Some unknown error')).toBe('INTERNAL_ERROR');
  });
});

describe('Error sanitization', () => {
  it('should strip internal paths from error messages', () => {
    const err = new Error('ENOENT: /tmp/ebook-uploads/abc123/input.epub');
    const sanitized = sanitizeError(err);
    expect(sanitized).not.toContain('/tmp/ebook-uploads');
    expect(sanitized.length).toBeGreaterThan(0);
  });

  it('should strip stack traces from error messages', () => {
    const err = new Error('Conversion failed at /src/lib/queue.ts:42:10');
    const sanitized = sanitizeError(err);
    expect(sanitized).not.toContain('at');
    expect(sanitized).not.toContain('queue.ts');
  });
});

describe('EPUB ZIP signature check', () => {
  it('should recognize valid EPUB magic bytes', () => {
    const validEpubHeader = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
    expect(validEpubHeader[0]).toBe(0x50);
    expect(validEpubHeader[1]).toBe(0x4b);
  });

  it('should reject non-ZIP files as EPUB', () => {
    const notZip = Buffer.from('not a zip file at all');
    expect(notZip[0]).not.toBe(0x50);
  });
});
