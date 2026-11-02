import JSZip from 'jszip';
import { executeConversion } from '@/lib/conversion';

describe('EPUB to DOCX actual output contract', () => {
  it('preserves Unicode chapter text in readable OOXML, without promising images or heading styles', async () => {
    const zip = new JSZip();
    zip.file('mimetype', 'application/epub+zip');
    zip.file('META-INF/container.xml', '<?xml version="1.0"?><container><rootfiles><rootfile full-path="OEBPS/content.opf"/></rootfiles></container>');
    zip.file('OEBPS/content.opf', '<package><metadata><title>Capability fixture</title></metadata><manifest><item id="c1" href="one.xhtml" media-type="application/xhtml+xml"/><item id="img" href="image.png" media-type="image/png"/></manifest><spine><itemref idref="c1"/></spine></package>');
    zip.file('OEBPS/one.xhtml', '<html><body><h1>Capítulo español</h1><p>Texto editable con ñ y 中文. Original paragraph.</p><img src="image.png"/></body></html>');
    zip.file('OEBPS/image.png', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB', 'base64'));
    const input = await zip.generateAsync({ type: 'nodebuffer' });
    const result = await executeConversion(input.toString('base64'), null, 'epub', 'docx', 'governance-docx-capability');
    expect(result.extension).toBe('docx');
    const output = await JSZip.loadAsync(Buffer.from(result.base64Data, 'base64'));
    expect(output.file('[Content_Types].xml')).not.toBeNull();
    const document = await output.file('word/document.xml')!.async('string');
    expect(document).toContain('Capítulo español');
    expect(document).toContain('Texto editable con ñ y 中文');
    expect(document).not.toContain('<w:drawing');
    expect(Object.keys(output.files).some(p => p.startsWith('word/media/'))).toBe(false);
    expect(document).not.toContain('Heading1');
  });
});
