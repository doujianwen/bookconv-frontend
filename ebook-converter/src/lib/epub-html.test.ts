import JSZip from 'jszip';
import { epubToHtmlArchive } from './epub-html';
import { executeConversion, isPureJsConversion } from './conversion';

async function fixture(existingIndex = false) {
  const zip = new JSZip();
  zip.file('mimetype', 'application/epub+zip');
  zip.file('META-INF/container.xml', '<container><rootfiles><rootfile full-path="OEBPS/content.opf"/></rootfiles></container>');
  zip.file('OEBPS/content.opf', '<package><metadata><title>Test</title></metadata><manifest><item id="b" href="b.xhtml"/><item id="a" href="a.xhtml"/></manifest><spine><itemref idref="a"/><itemref idref="b"/></spine></package>');
  zip.file('OEBPS/a.xhtml', '<html><body><p>First chapter</p></body></html>');
  zip.file('OEBPS/b.xhtml', '<html><body><p>Second chapter</p></body></html>');
  zip.file('OEBPS/style.css', 'p { color: navy; }');
  zip.file('OEBPS/picture.png', Buffer.from([137, 80, 78, 71]));
  if (existingIndex) zip.file('index.html', 'original index');
  return zip;
}

it('preserves chapter and resource bytes and indexes spine order', async () => {
  const input = await fixture();
  const out = await JSZip.loadAsync(await epubToHtmlArchive(await input.generateAsync({ type: 'nodebuffer' })));
  const index = await out.file('index.html')!.async('string');
  expect(index.indexOf('OEBPS/a.xhtml')).toBeLessThan(index.indexOf('OEBPS/b.xhtml'));
  for (const name of ['OEBPS/a.xhtml', 'OEBPS/style.css', 'OEBPS/picture.png']) {
    expect(await out.file(name)!.async('nodebuffer')).toEqual(await input.file(name)!.async('nodebuffer'));
  }
});
it('does not overwrite an existing root index', async () => {
  const input = await fixture(true);
  const out = await JSZip.loadAsync(await epubToHtmlArchive(await input.generateAsync({ type: 'nodebuffer' })));
  expect(await out.file('index.html')!.async('string')).toBe('original index');
  expect(out.file('bookconv-index-0.html')).not.toBeNull();
});
it('rejects missing chapters and unsafe archive paths', async () => {
  const missing = await fixture();
  missing.remove('OEBPS/a.xhtml');
  await expect(epubToHtmlArchive(await missing.generateAsync({ type: 'nodebuffer' }))).rejects.toThrow('spine chapter not found');
  const unsafe = await fixture();
  unsafe.file('../escape.txt', 'unsafe');
  await expect(epubToHtmlArchive(await unsafe.generateAsync({ type: 'nodebuffer' }))).rejects.toThrow('unsafe archive path');
});
it('executes the real local conversion and returns a ZIP', async () => {
  const input = await (await fixture()).generateAsync({ type: 'nodebuffer' });
  expect(isPureJsConversion('epub', 'html')).toBe(true);
  const result = await executeConversion(input.toString('base64'), null, 'epub', 'html', 'test-epub-html-local');
  expect(result.extension).toBe('zip');
  expect(result.mimeType).toBe('application/zip');
  expect((await JSZip.loadAsync(Buffer.from(result.base64Data, 'base64'))).file('index.html')).not.toBeNull();
});
