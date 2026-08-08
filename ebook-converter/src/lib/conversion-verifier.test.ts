// Regression tests for the pure-critic conversion verifier.
//
// Key regression: content-loss text comparison must only run when the OUTPUT
// side has extractable text. For pdf/mobi/azw3 targets (typical CloudConvert
// output) the output side has no extractable text — comparing would falsely
// veto every conversion as "content-loss". These tests pin that behavior.

import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import JSZip from 'jszip';
import { verifyConversion } from './conversion-verifier';

const BOOK_TEXT =
  'This is a sufficiently long book body used to make the extracted input ' +
  'text comfortably exceed the 200-char threshold. '.repeat(12);

async function makeEpub(text: string): Promise<Buffer> {
  const zip = new JSZip();
  zip.file('mimetype', 'application/epub+zip');
  zip.file(
    'META-INF/container.xml',
    '<?xml version="1.0"?><container><rootfiles><rootfile full-path="content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>',
  );
  zip.file(
    'content.opf',
    '<?xml version="1.0"?><package><metadata><dc:title>Test</dc:title></metadata><manifest><item id="c1" href="chapter1.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="c1"/></spine></package>',
  );
  zip.file(
    'chapter1.xhtml',
    `<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml"><body><p>${text}</p></body></html>`,
  );
  return Buffer.from(await zip.generateAsync({ type: 'nodebuffer' }));
}

function withTempDir(fn: (dir: string) => Promise<void>): Promise<void> {
  const dir = mkdtempSync(path.join(tmpdir(), 'verifier-test-'));
  return fn(dir).finally(() => {
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      /* best-effort cleanup */
    }
  });
}

describe('verifyConversion', () => {
  it('passes epub -> pdf (CloudConvert output): magic-verified, no false content-loss veto', async () => {
    await withTempDir(async (dir) => {
      const inPath = path.join(dir, 'in.epub');
      const outPath = path.join(dir, 'out.pdf');
      writeFileSync(inPath, await makeEpub(BOOK_TEXT));
      // Minimal but realistic PDF header + body (magic %PDF-)
      writeFileSync(
        outPath,
        Buffer.concat([
          Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n', 'latin1'),
          Buffer.from('x'.repeat(1024)),
        ]),
      );

      const verdict = await verifyConversion(inPath, outPath, 'epub', 'pdf');
      expect(verdict.pass).toBe(true);
      expect(verdict.findings.some((f) => f.id === 'content-loss')).toBe(false);
    });
  });

  it('passes epub -> mobi (CloudConvert output): BOOKMOBI magic recognized', async () => {
    await withTempDir(async (dir) => {
      const inPath = path.join(dir, 'in.epub');
      const outPath = path.join(dir, 'out.mobi');
      writeFileSync(inPath, await makeEpub(BOOK_TEXT));
      writeFileSync(outPath, Buffer.concat([Buffer.from('BOOKMOBI', 'latin1'), Buffer.from('y'.repeat(1024))]));

      const verdict = await verifyConversion(inPath, outPath, 'epub', 'mobi');
      expect(verdict.pass).toBe(true);
      expect(verdict.findings.some((f) => f.id === 'format-mismatch')).toBe(false);
    });
  });

  it('still vetoes epub -> txt when output is a tiny stub (content-loss intact)', async () => {
    await withTempDir(async (dir) => {
      const inPath = path.join(dir, 'in.epub');
      const outPath = path.join(dir, 'out.txt');
      writeFileSync(inPath, await makeEpub(BOOK_TEXT));
      writeFileSync(outPath, 'tiny', 'utf8');

      const verdict = await verifyConversion(inPath, outPath, 'epub', 'txt');
      expect(verdict.pass).toBe(false);
      expect(verdict.findings.some((f) => f.id === 'content-loss')).toBe(true);
    });
  });

  it('passes epub -> txt with near-full text preserved', async () => {
    await withTempDir(async (dir) => {
      const inPath = path.join(dir, 'in.epub');
      const outPath = path.join(dir, 'out.txt');
      writeFileSync(inPath, await makeEpub(BOOK_TEXT));
      writeFileSync(outPath, BOOK_TEXT, 'utf8');

      const verdict = await verifyConversion(inPath, outPath, 'epub', 'txt');
      expect(verdict.pass).toBe(true);
    });
  });
});
