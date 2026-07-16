describe('TOC Preservation: Structural integrity', () => {
  it('should have consistent command structure across all conversions', () => {
    const { CONVERSION_MAP } = require('@/lib/conversion-map');
    for (const [key, cmd] of Object.entries(CONVERSION_MAP)) {
      expect(cmd.command).toBeDefined();
      expect(typeof cmd.command).toBe('function');
      const result = cmd.command('/path/to/input.epub', '/path/to/output.pdf');
      expect(typeof result).toBe('string');
      expect(result).toContain('input');
      expect(result).toContain('output');
    }
  });

  it('should use calibre tool for standard conversions', () => {
    const { CONVERSION_MAP } = require('@/lib/conversion-map');
    const standardConversions = ['epub-pdf', 'epub-txt', 'epub-azw3', 'pdf-epub'];
    for (const key of standardConversions) {
      expect(CONVERSION_MAP[key].tool).toBe('calibre');
    }
  });

  it('should use libreoffice for doc->epub', () => {
    const { CONVERSION_MAP } = require('@/lib/conversion-map');
    expect(CONVERSION_MAP['doc-epub'].tool).toBe('libreoffice+calibre');
  });

  it('should use djvulibre for djvu->pdf', () => {
    const { CONVERSION_MAP } = require('@/lib/conversion-map');
    expect(CONVERSION_MAP['djvu-pdf'].tool).toBe('djvulibre');
  });

  it('should use imagemagick for epub->jpg/png', () => {
    const { CONVERSION_MAP } = require('@/lib/conversion-map');
    expect(CONVERSION_MAP['epub-jpg'].tool).toBe('calibre+imagemagick');
    expect(CONVERSION_MAP['epub-png'].tool).toBe('calibre+imagemagick');
  });

  it('should generate correct shell commands', () => {
    const { CONVERSION_MAP } = require('@/lib/conversion-map');
    const cmd = CONVERSION_MAP['epub-pdf'].command('book.epub', 'book.pdf');
    expect(cmd).toContain('ebook-convert');
    expect(cmd).toContain('book.epub');
    expect(cmd).toContain('book.pdf');
  });

  it('should handle libreoffice chained commands', () => {
    const { CONVERSION_MAP } = require('@/lib/conversion-map');
    const cmd = CONVERSION_MAP['doc-epub'].command('document.doc', 'document.epub');
    expect(cmd).toContain('soffice');
    expect(cmd).toContain('--headless');
    expect(cmd).toContain('--convert-to docx');
    expect(cmd).toContain('ebook-convert');
  });

  it('should handle djvu direct conversion', () => {
    const { CONVERSION_MAP } = require('@/lib/conversion-map');
    const cmd = CONVERSION_MAP['djvu-pdf'].command('scan.djvu', 'scan.pdf');
    expect(cmd).toContain('ddjvu');
    expect(cmd).toContain('-format=pdf');
  });
});
