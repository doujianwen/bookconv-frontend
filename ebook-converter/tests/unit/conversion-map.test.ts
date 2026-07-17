// tests/unit/conversion-map.test.ts
describe('CONVERSION_MAP', () => {
  it('should have exactly 29 conversion paths', () => {
    const { CONVERSION_MAP } = require('@/lib/conversion-map');
    expect(Object.keys(CONVERSION_MAP).length).toBe(29);
  });

  it('should contain all expected conversion keys', () => {
    const { CONVERSION_MAP } = require('@/lib/conversion-map');
    const expectedKeys = [
      'epub-azw3', 'azw3-epub', 'epub-rtf', 'epub-jpg', 'epub-html', 'epub-doc',
      'fb2-epub', 'lit-epub', 'epub-pdf', 'rtf-epub', 'epub-png', 'azw3-mobi',
      'mobi-txt', 'epub-word', 'docx-epub', 'txt-epub', 'html-epub', 'epub-text',
      'azw3-pdf', 'mobi-epub', 'epub-txt', 'doc-epub', 'cbr-pdf', 'mobi-pdf',
      'pdf-epub', 'djvu-pdf', 'epub-mobi',
    ];
    for (const key of expectedKeys) {
      expect(CONVERSION_MAP).toHaveProperty(key);
    }
  });

  it('should have tool type for every conversion', () => {
    const { CONVERSION_MAP } = require('@/lib/conversion-map');
    for (const [key, cmd] of Object.entries(CONVERSION_MAP) as [string, any][]) {
      expect(cmd.tool).toBeDefined();
      expect(['calibre', 'calibre+imagemagick', 'libreoffice+calibre', 'djvulibre']).toContain(cmd.tool);
      expect(cmd.command).toBeDefined();
      expect(typeof cmd.command).toBe('function');
      expect(cmd.description).toBeDefined();
      expect(cmd.description.length).toBeGreaterThan(0);
    }
  });

  it('should generate correct command output', () => {
    const { CONVERSION_MAP } = require('@/lib/conversion-map');
    const epubToPdf = CONVERSION_MAP['epub-pdf'];
    const result = epubToPdf.command('input.epub', 'output.pdf');
    expect(result).toContain('ebook-convert');
    expect(result).toContain('input.epub');
    expect(result).toContain('output.pdf');
  });
});

describe('SUPPORTED_FORMATS', () => {
  it('should include all source and target formats from conversion map', () => {
    const { CONVERSION_MAP, SUPPORTED_FORMATS } = require('@/lib/conversion-map');
    const allFormats = new Set();
    for (const key of Object.keys(CONVERSION_MAP)) {
      const [src, tgt] = key.split('-');
      allFormats.add(src);
      allFormats.add(tgt);
    }
    for (const fmt of allFormats) {
      expect(SUPPORTED_FORMATS).toContain(fmt);
    }
  });

  it('should be sorted alphabetically', () => {
    const { SUPPORTED_FORMATS } = require('@/lib/conversion-map');
    const sorted = [...SUPPORTED_FORMATS].sort();
    expect(SUPPORTED_FORMATS).toEqual(sorted);
  });

  it('should not contain duplicates', () => {
    const { SUPPORTED_FORMATS } = require('@/lib/conversion-map');
    const unique = new Set(SUPPORTED_FORMATS);
    expect(SUPPORTED_FORMATS.length).toBe(unique.size);
  });
});

describe('getConversionKey', () => {
  it('should produce lowercase hyphenated format pair', () => {
    const { getConversionKey } = require('@/lib/conversion-map');
    expect(getConversionKey('EPUB', 'PDF')).toBe('epub-pdf');
    expect(getConversionKey('epub', 'pdf')).toBe('epub-pdf');
  });
});

describe('getConversion', () => {
  it('should return the conversion command for valid pairs', () => {
    const { getConversion } = require('@/lib/conversion-map');
    const conv = getConversion('epub', 'pdf');
    expect(conv).toBeDefined();
    expect(conv.tool).toBe('calibre');
  });

  it('should return undefined for unsupported pairs', () => {
    const { getConversion } = require('@/lib/conversion-map');
    const conv = getConversion('xyz', 'abc');
    expect(conv).toBeUndefined();
  });

  it('should be case-insensitive', () => {
    const { getConversion } = require('@/lib/conversion-map');
    expect(getConversion('EPUB', 'PDF')).toEqual(getConversion('epub', 'pdf'));
    expect(getConversion('Epub', 'Pdf')).toEqual(getConversion('epub', 'pdf'));
  });
});

describe('FORMAT_DISPLAY_NAMES', () => {
  it('should have display names for all supported formats', () => {
    const { SUPPORTED_FORMATS, FORMAT_DISPLAY_NAMES } = require('@/lib/conversion-map');
    for (const fmt of SUPPORTED_FORMATS) {
      expect(FORMAT_DISPLAY_NAMES[fmt]).toBeDefined();
    }
  });

  it('should have reasonable display names', () => {
    const { FORMAT_DISPLAY_NAMES } = require('@/lib/conversion-map');
    expect(FORMAT_DISPLAY_NAMES['epub']).toBe('EPUB');
    expect(FORMAT_DISPLAY_NAMES['pdf']).toBe('PDF');
    expect(FORMAT_DISPLAY_NAMES['word']).toBe('Word');
    expect(FORMAT_DISPLAY_NAMES['text']).toBe('Text');
  });
});
