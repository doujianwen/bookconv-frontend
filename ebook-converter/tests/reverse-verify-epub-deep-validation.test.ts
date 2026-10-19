/**
 * 反向验证：§3.5 EPUB 深度解压校验（2026-10-19 事故 job c3beac1b / 96272bbd）。
 *
 * 事故签名：ZIP 外壳完好（魔数 + 中央目录 + container.xml 文件名都在）但成员
 * deflate 数据损坏的 EPUB，通过旧浅校验后送 CloudConvert，import 阶段报
 * "Input task has failed"，用户看到模糊失败。
 *
 * 期望（判据双向）：
 *   注入事故 → validateInputFile 拒绝，错误信息含 "corrupt epub"（映射 CORRUPT_INPUT）
 *   正常文件 → 放行（不抛错），证明校验不误杀
 *
 * 构造方式：jszip 生成合法 EPUB → 在 chapter1.xhtml 的 deflate 数据区翻转一个
 * 字节（中央目录/文件名/CRC 结构不动，模拟"截断/坏导出"类真实损坏）。
 */
import JSZip from 'jszip';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { validateInputFile } from '@/lib/conversion';

/** 生成一个结构合法的最小 EPUB（mimetype STORE + container.xml + opf + xhtml） */
async function buildValidEpub(): Promise<Buffer> {
  const zip = new JSZip();
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
  zip.file(
    'META-INF/container.xml',
    `<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">` +
      `<rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`,
  );
  zip.file(
    'OEBPS/content.opf',
    `<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id">` +
      `<metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">urn:uuid:test</dc:identifier>` +
      `<dc:title>t</dc:title><dc:language>en</dc:language></metadata>` +
      `<manifest><item id="c1" href="chapter1.xhtml" media-type="application/xhtml+xml"/></manifest>` +
      `<spine><itemref idref="c1"/></spine></package>`,
  );
  zip.file(
    'OEBPS/chapter1.xhtml',
    `<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>c1</title></head>` +
      `<body><p>${'Hello epub world. '.repeat(200)}</p></body></html>`,
  );
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }) as Promise<Buffer>;
}

/** 在指定成员的 deflate 数据区翻转一个字节（本地头/文件名/中央目录均不动） */
function corruptMemberData(buf: Buffer, memberName: string): Buffer {
  const nameBytes = Buffer.from(memberName, 'utf8');
  // 扫描本地文件头签名 PK\x03\x04，且紧跟的文件名等于 memberName
  for (let i = 0; i <= buf.length - 30 - nameBytes.length; i++) {
    if (buf[i] !== 0x50 || buf[i + 1] !== 0x4b || buf[i + 2] !== 0x03 || buf[i + 3] !== 0x04) continue;
    const fnameLen = buf[i + 26] | (buf[i + 27] << 8);
    const extraLen = buf[i + 28] | (buf[i + 29] << 8);
    if (
      fnameLen === nameBytes.length &&
      buf.slice(i + 30, i + 30 + fnameLen).equals(nameBytes)
    ) {
      const dataStart = i + 30 + fnameLen + extraLen;
      const out = Buffer.from(buf);
      out[dataStart + 2] = out[dataStart + 2] ^ 0xff; // 翻转 deflate 流中的一个字节
      return out;
    }
  }
  throw new Error(`test setup failed: local header for ${memberName} not found`);
}

describe('reverse-verify: §3.5 EPUB deep decompression validation (2026-10-19)', () => {
  let dir: string;

  beforeAll(async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'epub-deep-verify-'));
  });

  afterAll(async () => {
    if (dir) await rm(dir, { recursive: true, force: true });
  });

  it('正常 EPUB 通过深度校验（不误杀）', async () => {
    const p = path.join(dir, 'good.epub');
    await writeFile(p, await buildValidEpub());
    await expect(validateInputFile(p, 'epub')).resolves.toBeUndefined();
  });

  it('成员 deflate 数据损坏的 EPUB 被拦下（corrupt epub → CORRUPT_INPUT）', async () => {
    const good = await buildValidEpub();
    const broken = corruptMemberData(good, 'OEBPS/chapter1.xhtml');
    const p = path.join(dir, 'broken-member.epub');
    await writeFile(p, broken);
    await expect(validateInputFile(p, 'epub')).rejects.toThrow(/corrupt epub/i);
  });

  it('container.xml 为空内容的 EPUB 被拦下', async () => {
    const zip = new JSZip();
    zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
    zip.file('META-INF/container.xml', '   ');
    zip.file('OEBPS/content.opf', '<package/>');
    zip.file('OEBPS/chapter1.xhtml', '<html><body><p>x</p></body></html>');
    const p = path.join(dir, 'empty-container.epub');
    await writeFile(p, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
    await expect(validateInputFile(p, 'epub')).rejects.toThrow(/corrupt epub/i);
  });

  it('非 ZIP 文件仍走原有浅校验（not a valid eBook format，行为不变）', async () => {
    const p = path.join(dir, 'fake.epub');
    await writeFile(p, Buffer.from('<html>not a zip</html>', 'utf8'));
    await expect(validateInputFile(p, 'epub')).rejects.toThrow(/not a valid eBook format/i);
  });
});
