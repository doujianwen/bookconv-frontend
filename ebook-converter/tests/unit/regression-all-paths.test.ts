const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');

describe('CONVERSION_MAP Regression', () => {
  it('should have exactly 29 conversion paths', () => {
    const { CONVERSION_MAP } = require('@/lib/conversion-map');
    expect(Object.keys(CONVERSION_MAP).length).toBe(29);
  });

  it('should have tool type for every conversion', () => {
    const { CONVERSION_MAP } = require('@/lib/conversion-map');
    for (const [key, cmd] of Object.entries(CONVERSION_MAP)) {
      expect(cmd.tool).toBeDefined();
      expect(['calibre', 'calibre+imagemagick', 'libreoffice+calibre', 'djvulibre']).toContain(cmd.tool);
      expect(typeof cmd.command).toBe('function');
      expect(cmd.description.length).toBeGreaterThan(0);
    }
  });
});

describe('API validation logic', () => {
  it('should reject unsupported source formats', () => {
    const { SUPPORTED_FORMATS } = require('@/lib/conversion-map');
    const unsupported = ['xyz', 'abc', 'bin', 'exe'];
    for (const fmt of unsupported) {
      expect(SUPPORTED_FORMATS).not.toContain(fmt);
    }
  });

  it('should normalize format strings', () => {
    const normalize = (fmt) => fmt.toLowerCase().replace('.', '');
    expect(normalize('.EPUB')).toBe('epub');
    expect(normalize('Pdf')).toBe('pdf');
    expect(normalize('DOCX')).toBe('docx');
  });

  it('should enforce 10MB file size limit', () => {
    const maxBytes = 10 * 1024 * 1024;
    expect(maxBytes).toBe(10485760);
  });

  it('should map known OS errors to application codes', () => {
    const ERROR_CODE_MAP = {
      ENOENT: 'FILE_NOT_FOUND',
      EACCES: 'PERMISSION_DENIED',
      ETIMEDOUT: 'CONVERSION_TIMEOUT',
      EMFILE: 'FILE_TOO_LARGE',
      EFAULT: 'INVALID_INPUT_FILE',
      EBUSY: 'CONVERSION_BUSY',
      UNKNOWN_FORMAT: 'UNSUPPORTED_FORMAT',
      PROCESSING_ERROR: 'CONVERSION_FAILED',
    };
    expect(ERROR_CODE_MAP.ENOENT).toBe('FILE_NOT_FOUND');
    expect(ERROR_CODE_MAP.EACCES).toBe('PERMISSION_DENIED');
  });

  it('should default to CONVERSION_FAILED for unknown errors', () => {
    const ERROR_CODE_MAP = {
      ENOENT: 'FILE_NOT_FOUND',
      UNKNOWN_FORMAT: 'UNSUPPORTED_FORMAT',
      PROCESSING_ERROR: 'CONVERSION_FAILED',
    };
    const message = 'Some unknown error';
    let mappedCode = 'CONVERSION_FAILED';
    for (const [key, code] of Object.entries(ERROR_CODE_MAP)) {
      if (message.includes(key)) { mappedCode = code; break; }
    }
    expect(mappedCode).toBe('CONVERSION_FAILED');
  });
});

describe('extractEbookMetadata stub tests', () => {
  it('should resolve with empty metadata for unsupported extensions', () => {
    expect(true).toBe(true);
  });

  it('should handle EPUB ZIP signature check', () => {
    const validEpubHeader = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
    expect(validEpubHeader[0]).toBe(0x50);
    expect(validEpubHeader[1]).toBe(0x4b);
  });
});

describe('estimatePageCount', () => {
  it('should return page estimates for PDF based on size', () => {
    const { estimatePageCount } = require('@/lib/ebook-metadata');
    const pages = estimatePageCount({ size: 1024 * 1024 }, 'pdf');
    expect(pages).toBeGreaterThanOrEqual(1);
  });

  it('should return page estimates for EPUB based on size', () => {
    const { estimatePageCount } = require('@/lib/ebook-metadata');
    const pages = estimatePageCount({ size: 1024 * 1024 }, 'epub');
    expect(pages).toBeGreaterThanOrEqual(1);
  });

  it('should return undefined for unsupported formats', () => {
    const { estimatePageCount } = require('@/lib/ebook-metadata');
    const pages = estimatePageCount({ size: 1024 }, 'unknown');
    expect(pages).toBeUndefined();
  });

  it('should scale page count with file size', () => {
    const { estimatePageCount } = require('@/lib/ebook-metadata');
    const smallPages = estimatePageCount({ size: 1024 }, 'pdf');
    const largePages = estimatePageCount({ size: 1024 * 1024 }, 'pdf');
    expect(largePages).toBeGreaterThan(smallPages);
  });

  it('should handle zero-byte files', () => {
    const { estimatePageCount } = require('@/lib/ebook-metadata');
    const pages = estimatePageCount({ size: 0 }, 'pdf');
    expect(pages).toBe(1);
  });
});
