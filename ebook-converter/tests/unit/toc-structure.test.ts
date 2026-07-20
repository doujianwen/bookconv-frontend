import { CONVERSION_MAP } from '@/lib/conversion-map';

describe('TOC Preservation: Structural integrity', () => {
  it('should have consistent tool type across all conversions', () => {
    for (const [key, entry] of Object.entries(CONVERSION_MAP) as [string, any][]) {
      expect(entry.tool).toBeDefined();
      expect(entry.description).toBeDefined();
      expect(entry.description.length).toBeGreaterThan(0);
    }
  });

  it('should use calibre tool for standard conversions', () => {
    const standardConversions = ['epub-pdf', 'epub-txt', 'epub-azw3', 'pdf-epub'];
    for (const key of standardConversions) {
      expect(CONVERSION_MAP[key].tool).toBe('calibre');
    }
  });

  it('should use libreoffice for doc->epub', () => {
    expect(CONVERSION_MAP['doc-epub'].tool).toBe('libreoffice+calibre');
  });

  it('should use imagemagick for epub->jpg/png', () => {
    expect(CONVERSION_MAP['epub-jpg'].tool).toBe('calibre+imagemagick');
    expect(CONVERSION_MAP['epub-png'].tool).toBe('calibre+imagemagick');
  });
});
