// 验证纯 JS mobi/azw3 → epub 路径（绕开 CloudConvert 402）。
// 构造一个最小合法 mobi（TPZ3 标识 + 内嵌 <body>），走真实 executeConversion。
import { executeConversion } from './conversion';
import JSZip from 'jszip';

function makeFakeMobi(bodyText: string): Buffer {
  const size = 256;
  const buf = Buffer.alloc(size, 0);
  // 偏移 60 写 TPZ3 → 通过 validateInputFile 的 AZW3 校验，且 mobiToTxt 走 azw3 分支
  buf.write('TPZ3', 60, 'latin1');
  buf.write(`<body>${bodyText}</body>`, 80, 'latin1');
  return buf;
}

describe('pure-JS mobi/azw3 -> epub', () => {
  it('mobi -> epub produces a valid EPUB that passes magic + structure checks', async () => {
    const body = 'Hello from the mobi source. This is chapter one.';
    const input = makeFakeMobi(body);
    const jobId = 'test-mobi-epub-001';

    const result = await executeConversion(
      input.toString('base64'),
      null,
      'mobi',
      'epub',
      jobId,
    );

    expect(result.extension).toBe('epub');
    expect(result.mimeType).toBe('application/epub+zip');

    const outBuf = Buffer.from(result.base64Data, 'base64');
    // 魔数必须是 ZIP（PK\x03\x04）——与 conversion-verifier 的检测一致
    expect(outBuf[0]).toBe(0x50);
    expect(outBuf[1]).toBe(0x4b);
    expect(outBuf[2]).toBe(0x03);

    const zip = await JSZip.loadAsync(outBuf);
    expect(await zip.file('mimetype')!.async('string')).toBe('application/epub+zip');
    expect(zip.file('META-INF/container.xml')).not.toBeNull();
    expect(zip.file('OEBPS/content.opf')).not.toBeNull();
    expect(zip.file('OEBPS/content.xhtml')).not.toBeNull();
    const xhtml = await zip.file('OEBPS/content.xhtml')!.async('string');
    expect(xhtml).toContain(body);
  });

  it('azw3 -> epub also routes through the pure-JS path', async () => {
    const body = 'Another chapter extracted from azw3.';
    const input = makeFakeMobi(body);
    const result = await executeConversion(
      input.toString('base64'),
      null,
      'azw3',
      'epub',
      'test-azw3-epub-001',
    );
    expect(result.extension).toBe('epub');
    const outBuf = Buffer.from(result.base64Data, 'base64');
    expect(outBuf[0]).toBe(0x50);
    expect(outBuf[1]).toBe(0x4b);
    const zip = await JSZip.loadAsync(outBuf);
    expect(await zip.file('mimetype')!.async('string')).toBe('application/epub+zip');
  });
});
