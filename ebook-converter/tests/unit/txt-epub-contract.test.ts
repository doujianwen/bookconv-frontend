import JSZip from 'jszip';
import { executeConversion } from '@/lib/conversion';

it('packages UTF-8 text as one document with blank-line paragraphs', async () => {
  const source = 'Chapter One\n中文电子书测试。 Español: pingüino.\n\nChapter Two\nThe final paragraph.';
  const result = await executeConversion(Buffer.from(source, 'utf8').toString('base64'), null, 'txt', 'epub', 'txt-epub-contract');
  const zip = await JSZip.loadAsync(Buffer.from(result.base64Data, 'base64'));
  const body = await zip.file('OEBPS/content.xhtml')!.async('string');
  const nav = await zip.file('OEBPS/nav.xhtml')!.async('string');
  const packageXml = await zip.file('OEBPS/content.opf')!.async('string');
  expect(body).toContain('中文电子书测试。 Español: pingüino.');
  expect(body.match(/<p>/g)).toHaveLength(2);
  expect(packageXml.match(/<itemref /g)).toHaveLength(1);
  expect(nav.match(/<li>/g)).toHaveLength(1);
  expect(nav).toContain('Converted Document');
});
