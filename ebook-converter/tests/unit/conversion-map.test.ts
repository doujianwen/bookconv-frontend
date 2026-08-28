import { CONVERSION_MAP, SUPPORTED_FORMATS, FORMAT_DISPLAY_NAMES, normalizeFormat, getConversionKey, getConversion } from '@/lib/conversion-map';

describe('CONVERSION_MAP', () => {
  it('should have exactly 26 conversion paths', () => {
    expect(Object.keys(CONVERSION_MAP).length).toBe(26);
  });

  it('should contain all expected conversion keys', () => {
    const expectedKeys = [
      'epub-azw3', 'azw3-epub', 'epub-rtf', 'epub-jpg', 'epub-html', 'epub-doc',
      'fb2-epub', 'lit-epub', 'epub-pdf', 'rtf-epub', 'epub-png', 'azw3-mobi',
      'mobi-txt', 'epub-docx', 'docx-epub', 'txt-epub', 'html-epub', 'epub-txt',
      'azw3-pdf', 'mobi-epub', 'doc-epub', 'cbr-pdf', 'mobi-pdf',
      'pdf-epub', 'djvu-pdf', 'epub-mobi',
    ];
    for (const key of expectedKeys) {
      expect(CONVERSION_MAP).toHaveProperty(key);
    }
  });

  it('should have tool type and description for every conversion', () => {
    for (const [key, entry] of Object.entries(CONVERSION_MAP) as [string, any][]) {
      expect(entry.tool).toBeDefined();
      expect(entry.description).toBeDefined();
      expect(typeof entry.description).toBe('string');
      expect(entry.description.length).toBeGreaterThan(0);
    }
  });
});

describe('SUPPORTED_FORMATS', () => {
  it('should include all source and target formats from conversion map', () => {
    const allFormats = new Set<string>();
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
    const sorted = [...SUPPORTED_FORMATS].sort();
    expect(SUPPORTED_FORMATS).toEqual(sorted);
  });

  it('should not contain duplicates', () => {
    const unique = new Set(SUPPORTED_FORMATS);
    expect(SUPPORTED_FORMATS.length).toBe(unique.size);
  });
});

describe('getConversionKey', () => {
  it('should produce lowercase hyphenated format pair', () => {
    expect(getConversionKey('EPUB', 'PDF')).toBe('epub-pdf');
    expect(getConversionKey('epub', 'pdf')).toBe('epub-pdf');
  });
});

describe('getConversion', () => {
  it('should return the conversion entry for valid pairs', () => {
    const conv = getConversion('epub', 'pdf');
    expect(conv).toBeDefined();
    expect(conv!.tool).toBe('calibre');
  });

  it('should return undefined for unsupported pairs', () => {
    const conv = getConversion('xyz', 'abc');
    expect(conv).toBeUndefined();
  });

  it('should be case-insensitive', () => {
    expect(getConversion('EPUB', 'PDF')).toEqual(getConversion('epub', 'pdf'));
    expect(getConversion('Epub', 'Pdf')).toEqual(getConversion('epub', 'pdf'));
  });
});

describe('FORMAT_DISPLAY_NAMES', () => {
  it('should have display names for all supported formats', () => {
    for (const fmt of SUPPORTED_FORMATS) {
      expect(FORMAT_DISPLAY_NAMES[fmt]).toBeDefined();
    }
  });

  it('should have reasonable display names', () => {
    expect(FORMAT_DISPLAY_NAMES['epub']).toBe('EPUB');
    expect(FORMAT_DISPLAY_NAMES['pdf']).toBe('PDF');
    expect(FORMAT_DISPLAY_NAMES['word']).toBeUndefined();
    expect(FORMAT_DISPLAY_NAMES['text']).toBeUndefined();
    // word/text are aliases resolved by normalizeFormat, not display names
    expect(normalizeFormat('word')).toBe('docx');
    expect(normalizeFormat('text')).toBe('txt');
  });
});

describe('normalizeFormat', () => {
  it('should lowercase and remove dots', () => {
    expect(normalizeFormat('.EPUB')).toBe('epub');
    expect(normalizeFormat('Pdf')).toBe('pdf');
    expect(normalizeFormat('DOCX')).toBe('docx');
  });

  it('should resolve display name aliases', () => {
    expect(normalizeFormat('word')).toBe('docx');
    expect(normalizeFormat('text')).toBe('txt');
  });
});
