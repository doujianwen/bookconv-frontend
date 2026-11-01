#!/usr/bin/env node
// Self-authored fixtures only. Network execution requires explicit --live.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { deflateSync } from 'node:zlib';
import JSZip from 'jszip';

const dir = path.resolve('_wb_tmp/complex-conversions', new Date().toISOString().replace(/[:.]/g, '-'));
fs.mkdirSync(dir, { recursive: true });
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
function crc32(bytes) {
  let crc = -1;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ -1) >>> 0;
}
function png(width, height) {
  const chunk = (name, data) => {
    const type = Buffer.from(name), size = Buffer.alloc(4), checksum = Buffer.alloc(4);
    size.writeUInt32BE(data.length); checksum.writeUInt32BE(crc32(Buffer.concat([type, data])));
    return Buffer.concat([size, type, data, checksum]);
  };
  const header = Buffer.alloc(13); header.writeUInt32BE(width); header.writeUInt32BE(height, 4); header[8] = 8; header[9] = 6;
  const pixels = Buffer.alloc((width * 4 + 1) * height);
  let seed = 123456789;
  for (let y = 0; y < height; y++) for (let x = 0; x < width * 4; x++) {
    seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
    pixels[y * (width * 4 + 1) + 1 + x] = seed & 255;
  }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header), chunk('IDAT', deflateSync(pixels)), chunk('IEND', Buffer.alloc(0))]);
}
async function epub(image) {
  const z = new JSZip();
  z.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
  z.file('META-INF/container.xml', '<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0"><rootfiles><rootfile full-path="OEBPS/book.opf" media-type="application/oebps-package+xml"/></rootfiles></container>');
  z.file('OEBPS/book.opf', '<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">urn:bookconv:complex-self-authored</dc:identifier><dc:title>Self-authored multilingual fixture</dc:title><dc:language>en</dc:language><meta property="dcterms:modified">2026-11-01T00:00:00Z</meta></metadata><manifest><item id="second" href="chapters/second.xhtml" media-type="application/xhtml+xml"/><item id="first" href="chapters/ch%20one.xhtml" media-type="application/xhtml+xml"/><item id="style" href="style.css" media-type="text/css"/><item id="pic" href="images/test.png" media-type="image/png"/><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/></manifest><spine><itemref idref="first"/><itemref idref="second"/></spine></package>');
  z.file('OEBPS/chapters/ch one.xhtml', '<html xmlns="http://www.w3.org/1999/xhtml" lang="en"><head><title>One</title><link rel="stylesheet" href="../style.css"/></head><body><h1>AMBER-OPENING</h1><p>中文电子书测试。 Español: pingüino, conversión. العربية: كتاب.</p><table><tr><th>Item</th><th>Value</th></tr><tr><td>TABLE-MARKER</td><td>42</td></tr></table><img src="../images/test.png" alt="Self-authored test pattern"/><p><a href="second.xhtml#note">Footnote</a></p></body></html>');
  z.file('OEBPS/chapters/second.xhtml', '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Two</title></head><body><h1>Second chapter</h1><p id="note">FOOTNOTE-MARKER</p><p>COBALT-ENDING</p></body></html>');
  z.file('OEBPS/nav.xhtml', '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>Contents</title></head><body><nav epub:type="toc"><ol><li><a href="chapters/ch%20one.xhtml">One</a></li><li><a href="chapters/second.xhtml">Two</a></li></ol></nav></body></html>');
  z.file('OEBPS/style.css', 'body { font-family: serif; } table { border-collapse: collapse; } td { border: 1px solid #333; } img { max-width: 100%; }');
  z.file('OEBPS/images/test.png', image);
  return z.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}
const smallImage = png(48, 48), largeImage = png(1200, 1200);
const small = await epub(smallImage), large = await epub(largeImage);
const cases = [
  { name: 'multilingual-html', input: small, source: 'epub', target: 'html', image: smallImage },
  { name: 'multilingual-text', input: small, source: 'epub', target: 'txt' },
  { name: 'multilingual-pdf', input: small, source: 'epub', target: 'pdf' },
  { name: 'large-html-direct', input: large, source: 'epub', target: 'html', image: largeImage, direct: true },
];
fs.writeFileSync(path.join(dir, 'complex-small.epub'), small);
fs.writeFileSync(path.join(dir, 'complex-large.epub'), large);
const results = { at: new Date().toISOString(), sample: 'Self-authored multilingual, table, image, footnote and percent-encoded path fixtures', results: [] };
if (process.argv.includes('--live')) {
  for (const item of cases) {
    const row = { name: item.name, source: item.source, target: item.target, direct: !!item.direct, inputBytes: item.input.length, inputSha256: sha(item.input), startedAt: new Date().toISOString() };
    try {
      const form = new FormData();
      form.append('source_format', item.source); form.append('target_format', item.target);
      if (item.direct) {
        const presign = await fetch('https://www.bookconv.com/api/upload/presign', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sourceFormat: item.source, size: item.input.length }), signal: AbortSignal.timeout(20000) });
        const p = await presign.json();
        if (!presign.ok) throw new Error(`Presign HTTP ${presign.status}`);
        row.uploadKey = p.key; // private evidence only; never log the signed upload URL
        const uploaded = await fetch(p.uploadUrl, { method: 'PUT', headers: { 'Content-Type': p.contentType }, body: item.input, signal: AbortSignal.timeout(90000) });
        row.uploadStatus = uploaded.status;
        if (!uploaded.ok) throw new Error(`Upload HTTP ${uploaded.status}`);
        form.append('upload_key', p.key);
      } else form.append('file', new Blob([item.input]), '自撰样本 café.epub');
      const r = await fetch('https://www.bookconv.com/api/convert', { method: 'POST', body: form, signal: AbortSignal.timeout(120000) });
      const out = Buffer.from(await r.arrayBuffer());
      Object.assign(row, { status: r.status, outputBytes: out.length, outputSha256: sha(out), contentType: r.headers.get('content-type'), disposition: r.headers.get('content-disposition'), backend: r.headers.get('x-conversion-backend') });
      if (!r.ok) row.error = out.toString().slice(0, 600);
      else {
        fs.writeFileSync(path.join(dir, `${item.name}.bin`), out);
        if (item.target === 'html') {
          const z = await JSZip.loadAsync(out), index = await z.file('index.html').async('string');
          row.readingOrder = index.indexOf('ch%20one.xhtml') < index.indexOf('second.xhtml');
          row.imageByteExact = (await z.file('OEBPS/images/test.png').async('nodebuffer')).equals(item.image);
          const chapter = await z.file('OEBPS/chapters/ch one.xhtml').async('string');
          row.multilingualSourcePreserved = chapter.includes('中文电子书测试') && chapter.includes('العربية') && chapter.includes('pingüino');
          row.tableAndFootnoteLink = chapter.includes('TABLE-MARKER') && chapter.includes('second.xhtml#note');
        } else if (item.target === 'txt') {
          const text = out.toString('utf8');
          row.markersPreserved = text.includes('AMBER-OPENING') && text.includes('COBALT-ENDING');
          row.chinesePreserved = text.includes('中文电子书测试');
          row.arabicPreserved = text.includes('العربية');
          row.tableTextPreserved = text.includes('TABLE-MARKER');
        } else row.independentPdfInspection = 'pending';
      }
    } catch (e) { row.error = e.message; }
    row.finishedAt = new Date().toISOString(); results.results.push(row);
    fs.writeFileSync(path.join(dir, 'results.json'), JSON.stringify(results, null, 2));
    console.log(JSON.stringify(row));
  }
}
console.log(JSON.stringify({ output: dir, smallBytes: small.length, largeBytes: large.length, live: process.argv.includes('--live') }));
