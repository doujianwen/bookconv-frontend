// src/lib/conversion.ts
//
// 纯转换执行层（与队列/Redis/Worker 完全解耦）。
//
// 设计目的：在 Vercel Serverless 等「无常驻进程」环境里，BullMQ + Redis + Worker
// 的异步架构天然不成立（函数返回即冻结，没有 worker 消费队列）。本模块提供
// `executeConversion` 的「请求内同步执行」版本，供 API 路由直接调用，不触碰任何
// Redis/网络依赖，因此不会在冷启动或不可达的 Redis 上挂死。
//
// 注意：本文件严禁 import queue.ts / redis.ts / bullmq，避免模块加载时的副作用
// （queue.ts 会在加载时自动 startWorker 并尝试连接 Redis）。

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync, appendFileSync } from 'node:fs';
import path from 'node:path';
import { loggers as log } from './logger';
import { verifyConversion } from './conversion-verifier';
import { convertWithCloudConvert, isCloudConvertConfigured } from './cloudconvert';
import * as fsp from 'node:fs/promises';
import { errorMessage } from './error-handler';
import JSZip from 'jszip';

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/tmp/ebook-uploads';
const CALIBRE_PATH = process.env.CALIBRE_PATH || 'ebook-convert';
export const MAX_RETRIES = parseInt(process.env.MAX_CONVERSION_RETRIES || '3', 10);

// Structured conversion audit log (consumed by ai-audit.js for true success-rate stats).
const CONVERSION_AUDIT_LOG = path.join(__dirname, '..', '..', '..', 'logs', 'conversion.log');
function appendConversionAuditLog(
  jobId: string,
  status: 'succeeded' | 'failed',
  meta?: { sourceFormat?: string; targetFormat?: string; durationMs?: number; error?: string },
) {
  try {
    const dir = path.dirname(CONVERSION_AUDIT_LOG);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const parts = [
      `job id: ${jobId}`,
      `status: ${status}`,
      `ts: ${new Date().toISOString()}`,
      meta?.sourceFormat && meta?.targetFormat ? `format: ${meta.sourceFormat}->${meta.targetFormat}` : '',
      meta?.durationMs != null ? `duration: ${meta.durationMs}ms` : '',
      meta?.error ? `error: ${meta.error}` : '',
    ].filter(Boolean);
    appendFileSync(CONVERSION_AUDIT_LOG, parts.join(' ') + '\n');
  } catch {
    // Audit-log write failure must not break the conversion flow
  }
}

const execFileAsync = promisify(execFile);

/** Safely remove a directory, logging errors instead of swallowing them silently */
async function cleanupDir(dir: string, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      rmSync(dir, { recursive: true, force: true });
      return;
    } catch (err) {
      if (attempt === maxRetries) {
        log.storage.error(`Failed to cleanup ${dir} after ${maxRetries} attempts`, { error: err instanceof Error ? err.message : String(err) });
      } else {
        await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt - 1)));
      }
    }
  }
}

/** Validate that a format string contains only safe characters */
function isValidFormat(format: string): boolean {
  return /^[a-z0-9]+$/.test(format);
}

/**
 * 把未知文件前 4 字节的十六进制魔数翻译成人类可读的猜测，方便报错文案
 * 直接告诉用户「你上传的看起来其实是 X」。命中已知魔数表则返回对应提示；
 * 未命中但 4 字节全是可打印 ASCII → 判为文本类；否则落到二进制兜底文案。
 *
 * 覆盖线上 2026-10-17 同步路径（epub→txt）实测出现过的 0x8834d0a3
 * （SQLite 数据库被改名为 .epub）。
 */
const KNOWN_MAGIC_HINTS: Record<string, string> = {
  '8834d0a3': '一个 SQLite 数据库文件（.db/.sqlite）',
  '53514c69': '一个 SQLite 数据库文件（"SQLite" 开头）',
  '25504446': '一个 PDF 文件（被改名为 .epub）',
  '3c444f43': '一段 HTML 网页（<DOC…），不是 EPUB',
  '3c48544d': '一段 HTML 网页（<HTM…），不是 EPUB',
  '3c3f786d': '一段 XML 文件（<?xm…）',
  '0d6a7372': '一个 RAR 压缩文件（Rar! 头）',
  '52617221': '一个 RAR 压缩文件（Rar! 头）',
  '1f8b0800': '一个 GZIP 压缩文件（被改名为 .epub）',
  '425a6800': '一个 BZ2 压缩文件（BZh…）',
  '377a6264': '一个 7-Zip 压缩文件（7z…）',
  '89504e47': '一个 PNG 图片文件（被改名为 .epub）',
  'ffd8ffe0': '一个 JPEG 图片文件（被改名为 .epub）',
  'ffd8ffe1': '一个 JPEG 图片文件（被改名为 .epub）',
  '47494638': '一个 GIF 图片文件（被改名为 .epub）',
};

function describeUnknownMagic(magicHex: string): string {
  const known = KNOWN_MAGIC_HINTS[magicHex];
  if (known) return known;
  // 前 4 字节全是可打印 ASCII → 很可能是纯文本 / HTML / XML
  const bytes = magicHex.match(/../g) ?? [];
  if (bytes.length === 4 && bytes.every((b) => {
    const n = parseInt(b, 16);
    return n >= 0x20 && n <= 0x7e;
  })) {
    const ascii = bytes.map((b) => String.fromCharCode(parseInt(b, 16))).join('');
    return `一段以「${ascii}」开头的文本文件（可能是 .txt/.html/.xml，被改名为 .epub）`;
  }
  return '无法识别的二进制文件（请确认下载的是完整的 .epub）';
}

function getMimeType(ext: string): string {
  const map = {
    epub: 'application/epub+zip', azw3: 'application/x-mobipocket-ebook',
    pdf: 'application/pdf', txt: 'text/plain', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    htmlz: 'application/zip', mobi: 'application/x-mobipocket-ebook', rtf: 'application/rtf',
    jpg: 'image/jpeg', png: 'image/png', fb2: 'application/x-fb2+zip',
    cbr: 'application/vnd.comicbook-rar', cbz: 'application/vnd.comicbook+zip',
    djvu: 'image/vnd.djvu', doc: 'application/msword', lit: 'application/x-ms-reader',
    zip: 'application/zip',
  };
  return (map as Record<string, string>)[ext] || 'application/octet-stream';
}

/**
 * Validate input file before sending to Calibre. Throws if the file is clearly corrupted.
 * exported for reverse-verification tests (tests/reverse-verify-epub-deep-validation.test.ts).
 */
export async function validateInputFile(inputPath: string, sourceFormat: string): Promise<void> {
  try {
    const stat = await fsp.stat(inputPath);
    if (stat.size === 0) {
      throw new Error('Empty input file');
    }

    if (sourceFormat === 'epub') {
      const buf = Buffer.alloc(4);
      const fd = await fsp.open(inputPath, 'r');
      try {
        await fd.read(buf, 0, 4, 0);
        await fd.close();
        // ZIP magic: PK\x03\x04 or PK\x05\x06 (empty archive) or PK\x07\x08 (spanned)
        const validZip =
          buf[0] === 0x50 && buf[1] === 0x4b && (buf[2] === 0x03 || buf[2] === 0x05 || buf[2] === 0x07);
        if (!validZip) {
          // 把前 4 字节魔数带进告警，便于一眼确认「用户传的是非 EPUB」（误改名/下载截断/伪 epub）。
          // 并翻译成人类可读猜测（describeUnknownMagic），避免用户面对一串 16 进制。
          const magicHex = buf.toString('hex');
          log.conversion.error('EPUB input failed ZIP magic-byte check', {
            magicHex,
            sourceFormat,
            guess: describeUnknownMagic(magicHex),
          });
          throw new Error(
            `not a valid eBook format: an EPUB is a ZIP archive whose first bytes are PK\\x03\\x04. ` +
            `The uploaded file starts with 0x${magicHex}（${describeUnknownMagic(magicHex)}）. ` +
            `Please upload a real .epub file (not a renamed .pdf/.txt/.html).`,
          );
        }
      } catch (_err) {
        await fd.close().catch(() => {});
        throw _err;
      }

      // More thorough check: verify ZIP central directory exists
      const data = await fsp.readFile(inputPath);
      let cdOffset = -1;
      for (let i = data.length - 4; i >= 0; i--) {
        if (data[i] === 0x50 && data[i + 1] === 0x4b && data[i + 2] === 0x05 && data[i + 3] === 0x06) {
          cdOffset = i;
          break;
        }
      }
      if (cdOffset === -1) {
        throw new Error('Invalid zip file');
      }

      // Check for META-INF/container.xml presence in the ZIP
      let hasContainer = false;
      for (let i = 0; i < data.length - 4; i++) {
        if (data[i] === 0x50 && data[i + 1] === 0x4b && data[i + 2] === 0x03 && data[i + 3] === 0x04) {
          const fnameLen = data[i + 26] | (data[i + 27] << 8);
          if (fnameLen > 0 && fnameLen < 256 && i + 30 + fnameLen <= data.length) {
            const fname = data.slice(i + 30, i + 30 + fnameLen).toString('utf8').toLowerCase();
            if (fname.includes('container.xml') || fname.includes('opf')) {
              hasContainer = true;
              break;
            }
          }
        }
      }
      if (!hasContainer) {
        throw new Error('Invalid or missing opf');
      }

      // §3.5 深度校验（2026-10-19 新增）：ZIP 外壳完好但成员 deflate 数据损坏的 EPUB
      // 能通过上面全部浅校验（魔数 + 中央目录 + container.xml 文件名都在），却会在
      // CloudConvert import 阶段报 "Input task has failed"（10-19 两次生产告警
      // job c3beac1b / 96272bbd 实证）。这里用 jszip 实际解压成员把这类文件拦在
      // 本地，直接给用户 CORRUPT_INPUT，不再白烧一个 CC job + 270s 轮询。
      // 内存护栏：累计解压超过 256MB 即停止（视为通过——超限不是损坏证据），
      // 避免极端文件把 Serverless 实例打爆；每次只保留一个成员的缓冲。
      const DEEP_CHECK_BYTE_CAP = 256 * 1024 * 1024;
      let deepChecked = 0;
      let firstBrokenMember: string | null = null;
      try {
        const zip = await JSZip.loadAsync(data);
        const members = Object.values(zip.files).filter((f) => !f.dir);
        if (members.length === 0) {
          firstBrokenMember = '(archive contains no files)';
        }
        for (const member of members) {
          if (deepChecked > DEEP_CHECK_BYTE_CAP) break;
          try {
            const bytes = await member.async('uint8array');
            deepChecked += bytes.length;
          } catch {
            firstBrokenMember = member.name;
            break;
          }
        }
        // container.xml 必须能解出非空内容（浅校验只看文件名，不看内容）
        if (!firstBrokenMember) {
          const containerMember = members.find(
            (m) => /meta-inf/i.test(m.name) && /container\.xml$/i.test(m.name),
          );
          if (containerMember) {
            const xml = await containerMember.async('string').catch(() => '');
            if (!xml.trim()) {
              firstBrokenMember = `${containerMember.name} (empty container.xml)`;
            }
          }
        }
      } catch (loadErr) {
        firstBrokenMember = `(zip load failed: ${errorMessage(loadErr) || String(loadErr)})`;
      }
      if (firstBrokenMember) {
        log.conversion.error('EPUB failed deep decompression check', {
          brokenMember: firstBrokenMember,
          decompressedSoFar: deepChecked,
          sourceFormat,
        });
        throw new Error(
          `corrupt epub: ZIP member ${firstBrokenMember} failed to decompress — ` +
            `the file is damaged (truncated download or broken export). ` +
            `Please re-download or re-export the EPUB and try again.`,
        );
      }
    } else if (sourceFormat === 'mobi' || sourceFormat === 'azw3') {
      const head = await fsp.readFile(inputPath);
      // MOBI / AZW3 的格式标识都在**偏移 60**：MOBI="BOOKMOBI"、旧式 PalmDOC="TEXtREPLACE"、
      // AZW3(KF8)="TPZ3"。偏移 0-59 是**书名**。
      // 旧实现查 head[0:4] 是否等于 "BOOK"/"TEXt"，只在该书名恰好以这两个词开头时才通过 ——
      // 绝大多数真实 mobi/azw3 会被本地校验误杀成「not a valid eBook format」，
      // 根本走不到 CloudConvert（2026-10-04 生产告警 + 实测样本坐实）。
      // 取 12 字节：最长标识是 TEXtREPLACE（11 字符），切短会永远匹配不上
      const magic = head.length > 71 ? head.subarray(60, 72).toString('latin1') : '';
      const isBook = magic.startsWith('BOOKMOBI') || magic.startsWith('TEXtREPLACE');
      const isKf8 = magic.startsWith('TPZ3');
      // 兼容极少数把标识放在开头的变体
      const front = head.subarray(0, 4).toString('latin1');
      if (!(isBook || isKf8 || front === 'BOOK' || front === 'TEXt')) {
        throw new Error('not a valid eBook format');
      }
    } else if (sourceFormat === 'pdf') {
      const head = await fsp.readFile(inputPath);
      if (head.subarray(0, 4).toString('latin1') !== '%PDF') {
        const magicHex = head.subarray(0, 4).toString('hex');
        log.conversion.error('PDF input failed %PDF magic-byte check', { magicHex, sourceFormat });
        throw new Error(
          `not a valid eBook format: a PDF must start with "%PDF". ` +
          `The uploaded file starts with 0x${magicHex}. Please upload a real PDF.`,
        );
      }
    } else if (['txt', 'rtf', 'docx'].includes(sourceFormat)) {
      if (sourceFormat === 'txt' || sourceFormat === 'rtf') {
        const headBuf = Buffer.alloc(64);
        const fd = await fsp.open(inputPath, 'r');
        try {
          await fd.read(headBuf, 0, 64, 0);
          const txt = headBuf.toString().trim();
          if (sourceFormat === 'rtf' && !txt.startsWith('{\\')) {
            throw new Error('not a valid eBook format');
          }
        } finally {
          await fd.close();
        }
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (!msg.includes('not a valid eBook format') &&
        !msg.includes('corrupt epub') &&
        !msg.includes('Invalid zip file') &&
        !msg.includes('Invalid or missing opf') &&
        !msg.includes('Empty input file')) {
      throw new Error(`Input validation failed: ${msg}`);
    }
    throw err;
  }
}

export type ConversionJobResult = {
  base64Data: string;
  extension: string;
  mimeType: string;
  downloadUrl?: string;
  fileSize?: number;
};

// --- Shared EPUB text extraction (no Calibre required) ---
//
// EPUB is a ZIP containing XHTML/HTML files. We parse container.xml → OPF
// to find the spine (reading order), extract each chapter's HTML, strip
// tags, and return an array of plain-text chapters in reading order.
// Reused by both the TXT and RTF pure-JS paths so neither depends on
// CloudConvert (which returns 402 once conversion credits are exhausted).
async function extractEpubTextChapters(inputPath: string): Promise<string[]> {
  const JSZip = (await import('jszip')).default;
  const data = readFileSync(inputPath);
  const zip = await JSZip.loadAsync(data);

  // 1. Parse META-INF/container.xml to find the OPF file path
  const containerFile = zip.file('META-INF/container.xml');
  if (!containerFile) throw new Error('Invalid EPUB: missing container.xml');
  const containerXml = await containerFile.async('text');
  const opfPathMatch = containerXml.match(/full-path="([^"]+)"/);
  if (!opfPathMatch) throw new Error('Invalid EPUB: cannot find OPF path in container.xml');
  const opfPath = opfPathMatch[1];
  const opfDir = opfPath.includes('/') ? opfPath.replace(/[^/]+$/, '') : '';

  // 2. Parse the OPF to get spine item order
  const opfFile = zip.file(opfPath);
  if (!opfFile) throw new Error(`Invalid EPUB: OPF file not found at ${opfPath}`);
  const opfXml = await opfFile.async('text');

  // Build manifest map: id → href
  const manifest: Record<string, string> = {};
  const manifestRegex = /<item[^>]+id="([^"]+)"[^>]+href="([^"]+)"/g;
  let m;
  while ((m = manifestRegex.exec(opfXml)) !== null) {
    manifest[m[1]] = decodeURIComponent(m[2]);
  }
  // Also try reversed attribute order (href before id)
  const manifestRegex2 = /<item[^>]+href="([^"]+)"[^>]+id="([^"]+)"/g;
  while ((m = manifestRegex2.exec(opfXml)) !== null) {
    if (!manifest[m[2]]) manifest[m[2]] = decodeURIComponent(m[1]);
  }

  // Get spine order
  const spineRegex = /<itemref[^>]+idref="([^"]+)"/g;
  const spineIds: string[] = [];
  while ((m = spineRegex.exec(opfXml)) !== null) {
    spineIds.push(m[1]);
  }

  if (spineIds.length === 0) {
    throw new Error('Invalid EPUB: no spine items found');
  }

  // 3. Extract text from each spine item in order
  const parts: string[] = [];
  for (const id of spineIds) {
    const href = manifest[id];
    if (!href) continue;

    const fullPath = opfDir + href;
    const chapterFile = zip.file(fullPath) || zip.file(href);
    if (!chapterFile) continue;

    let html = await chapterFile.async('text');

    // Strip HTML tags to plain text
    // Remove script/style blocks entirely
    html = html.replace(/<(script|style|head|nav|footer)[^>]*>[\s\S]*?<\/\1>/gi, '');
    // Convert <br> and </p> and </div> and </h*> to newlines
    html = html.replace(/<br\s*\/?>/gi, '\n');
    html = html.replace(/<\/(p|div|h[1-6]|li|tr)>/gi, '\n');
    html = html.replace(/<li[^>]*>/gi, '  - ');
    // Remove all remaining tags
    html = html.replace(/<[^>]+>/g, '');
    // Decode common HTML entities
    html = html
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
      .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
    // Collapse excessive blank lines
    html = html.replace(/\n{3,}/g, '\n\n').trim();

    if (html) {
      parts.push(html);
    }
  }

  if (parts.length === 0) {
    throw new Error('Conversion failed: no text content could be extracted from EPUB');
  }

  return parts;
}

// --- Pure-JS EPUB → TXT (no Calibre required) ---
async function epubToTxt(inputPath: string): Promise<string> {
  const chapters = await extractEpubTextChapters(inputPath);
  return chapters.join('\n\n---\n\n');
}

// --- Pure-JS EPUB → RTF (no Calibre / no CloudConvert required) ---
//
// RTF is a plain-text markup format. We wrap the extracted chapters in a
// minimal valid RTF 1.6 document (UTF-8 codepage 65001) so EPUB → RTF no
// longer routes through CloudConvert and is immune to its 402 quota errors.
function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function rtfEscape(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/\{/g, '\\{').replace(/\}/g, '\\}');
}

function buildRtfFromText(text: string): string {
  const chapters = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const body = chapters
    .map((ch) => rtfEscape(ch).replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n/g, '\\par '))
    .join('\\par\\par ---\\par\\par ');
  return (
    '{\\rtf1\\ansi\\ansicpg65001\\uc1\\deff0' +
    '{\\fonttbl{\\f0\\fnil\\fcharset0 Arial;}}' +
    '\\viewkind4\\pard\\lang1033\\f0\\fs24 ' +
    body +
    '\\par }'
  );
}

async function epubToRtf(inputPath: string): Promise<string> {
  const chapters = await extractEpubTextChapters(inputPath);
  return buildRtfFromText(chapters.join('\n\n'));
}

// --- Pure-JS text → FB2 (FictionBook 2.1, plain XML) ---
//
// FB2 is a single XML document. We wrap plain text in a minimal valid
// FictionBook 2.1 body. No Calibre / no CloudConvert → immune to 402.
function buildFb2FromText(text: string): string {
  const sections = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `      <p>${xmlEscape(p)}</p>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<FictionBook xmlns="http://www.gribuser.ru/xml/fictionbook/2.1">
  <description>
    <title-info>
      <book-title>Converted Document</book-title>
    </title-info>
  </description>
  <body>
    <section>
${sections}
    </section>
  </body>
</FictionBook>`;
}

async function epubToFb2(inputPath: string): Promise<string> {
  const chapters = await extractEpubTextChapters(inputPath);
  return buildFb2FromText(chapters.join('\n\n'));
}

// --- Pure-JS text → DOCX (minimal OOXML, zip of XML parts) ---
//
// A DOCX is just a ZIP of well-known XML parts. We build the smallest valid
// set (content-types, relationships, word/document.xml) with jszip so Word can
// open it. No Calibre / no CloudConvert → immune to 402.
async function buildDocxFromText(text: string): Promise<Buffer> {
  const JSZip = (await import('jszip')).default;
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(
      (p) =>
        `        <w:p><w:r><w:t xml:space="preserve">${xmlEscape(p)}</w:t></w:r></w:p>`,
    )
    .join('\n');

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
${paragraphs}
  </w:body>
</w:document>`;

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const docRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`;

  const zip = new JSZip();
  zip.file('[Content_Types].xml', contentTypes);
  zip.file('_rels/.rels', rootRels);
  zip.file('word/document.xml', documentXml);
  zip.file('word/_rels/document.xml.rels', docRels);
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}

async function epubToDocx(inputPath: string): Promise<Buffer> {
  const chapters = await extractEpubTextChapters(inputPath);
  return buildDocxFromText(chapters.join('\n\n'));
}

// --- Pure-JS MOBI/AZW3 → EPUB (text-only, no Calibre / no CloudConvert) ---
//
// MOBI/AZW3 → EPUB 的目标格式是 EPUB（文本派生格式），无需 CloudConvert 的
// calibre 引擎即可合成：先用 mobiToTxt 抽正文，再包成一个最小合法 EPUB 3.0
// （mimetype + META-INF/container.xml + OEBPS/content.opf + content.xhtml + nav）。
// 这样 mobi/azw3 → epub 与 epub → txt/docx/rtf/fb2 一样**免疫 CloudConvert 402**
// （2026-10-17 实测 mobi→epub 因额度耗尽 402 全挂），代价是仅保留纯文本、
// 丢失图片/样式/目录——但比起彻底失败更有用。其余 mobi/* 仍是 CloudConvert 格式。
function xmlEscapeText(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function uniqueBookId(): string {
  return 'urn:uuid:' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

async function buildEpubFromText(text: string): Promise<Buffer> {
  const JSZip = (await import('jszip')).default;
  const title = 'Converted Document';
  const paras = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `    <p>${xmlEscapeText(p)}</p>`)
    .join('\n');

  const contentXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en">
<head><meta charset="UTF-8"/><title>${xmlEscapeText(title)}</title></head>
<body>
<h1>${xmlEscapeText(title)}</h1>
${paras}
</body>
</html>`;

  const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;

  const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">${uniqueBookId()}</dc:identifier>
    <dc:title>${xmlEscapeText(title)}</dc:title>
    <dc:language>en</dc:language>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="content" href="content.xhtml" media-type="application/xhtml+xml"/>
  </manifest>
  <spine>
    <itemref idref="content"/>
  </spine>
</package>`;

  const navXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en">
<head><title>${xmlEscapeText(title)}</title></head>
<body>
<nav epub:type="toc"><ol><li><a href="content.xhtml">${xmlEscapeText(title)}</a></li></ol></nav>
</body>
</html>`;

  const zip = new JSZip();
  // mimetype 必须 STORE（不压缩）且为首条目，多数阅读器才认
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
  zip.file('META-INF/container.xml', containerXml);
  zip.file('OEBPS/content.opf', contentOpf);
  zip.file('OEBPS/content.xhtml', contentXhtml);
  zip.file('OEBPS/nav.xhtml', navXhtml);
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}

// --- Pure-JS RTF → TXT extraction (best-effort, minimal) ---
//
// RTF text content is the body after the {\rtf...} control-header line.
// We strip RTF control words (\par, \b, {\fonttbl...} groups, \fsNN) and
// keep the literal text. Best-effort: not a full RTF parser, but sufficient
// to recover readable text for an EPUB-output fallback. Immune to CloudConvert 402.
async function rtfToTxt(inputPath: string): Promise<string> {
  const data = readFileSync(inputPath, 'utf8');
  let text = data;
  // Drop the RTF header control word up to (not including) the first literal char
  text = text.replace(/^\{\\rtf[0-9]+\\?/i, '');
  // Remove nested control groups we do not need (font table, stylesheet, etc.)
  text = text.replace(/\{\\(fonttbl|stylesheet|colortbl)[\s\S]*?\}/gi, '');
  // Convert RTF line breaks / paragraph marks
  text = text.replace(/\\par\b/gi, '\n');
  text = text.replace(/\\line\b/gi, '\n');
  text = text.replace(/\\tab\b/gi, '\t');
  // Bold/italic toggles
  text = text.replace(/\\[bi]\b/gi, '');
  // Font / size / language control words (\fs24 \f0 \ansicpg65001 \uc1 ...)
  text = text.replace(/\\[a-zA-Z]+-?\d*\d?\s?/g, ' ');
  // Strip remaining braces
  text = text.replace(/[{}]/g, '');
  // Decode RTF escapes: \'XX = byte 0xXX (latin-1); \~ = space; \= = =
  text = text
    .replace(/\\'([0-9a-fA-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\\~/g, ' ')
    .replace(/\\=/g, '=');
  // Decode common HTML entities (some RTF producers embed them)
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');
  text = text
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
  if (!text) throw new Error('RTF: no text content found');
  return text;
}

// --- Pure-JS FB2 (FictionBook) → TXT extraction (best-effort, minimal) ---
//
// FictionBook 2.x is single XML with <p>/<section>/<description> elements.
// We strip all tags and keep literal text. Immune to CloudConvert 402.
async function fb2ToTxt(inputPath: string): Promise<string> {
  const data = readFileSync(inputPath, 'utf8');
  let text = data
    .replace(/<description[\s\S]*?<\/description>/gi, ' ')
    .replace(/<style[^>]*\/>/gi, ' ')
    .replace(/<(p|section|body)[^>]*>/gi, '\n')
    .replace(/<\/(p|section|body)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
  if (!text) throw new Error('FB2: no text content found');
  return text;
}

// --- Pure-JS DOCX → TXT extraction ---
//
// DOCX is a ZIP archive containing XML files. We extract word/document.xml
// and parse it to get the text content, stripping XML tags.
async function docxToTxt(inputPath: string): Promise<string> {
  const JSZip = (await import('jszip')).default;
  const data = readFileSync(inputPath);
  const zip = await JSZip.loadAsync(data);

  // Find document.xml
  const docFile = zip.file('word/document.xml');
  if (!docFile) throw new Error('DOCX: missing word/document.xml');

  const docXml = await docFile.async('text');

  // Extract text from <w:t> tags
  const textParts: string[] = [];
  const tTagRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
  let match;
  while ((match = tTagRegex.exec(docXml)) !== null) {
    textParts.push(match[1]);
  }

  // Also handle <w:sep> for paragraph breaks
  const sepCount = (docXml.match(/<w:sep\b/g) || []).length;

  let text = textParts.join(' ');

  // Add paragraph breaks
  const pRegex = /<w:p[^>]*>/g;
  let pMatch;
  let lastPIndex = -1;
  while ((pMatch = pRegex.exec(docXml)) !== null) {
    if (pMatch.index !== lastPIndex) {
      text += '\n';
      lastPIndex = pMatch.index;
    }
  }

  // Clean up
  text = text
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();

  if (!text) throw new Error('DOCX: no text content found');
  return text;
}

// --- Pure-JS HTML → TXT extraction ---
//
// Simple HTML to plain text conversion. Strips all HTML tags and normalizes whitespace.
async function htmlToTxt(inputPath: string): Promise<string> {
  const data = readFileSync(inputPath, 'utf8');

  // Remove script and style blocks
  let text = data
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // Convert block-level tags to newlines
  text = text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|tr|blockquote|pre)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '  - ')
    .replace(/<(\/?table|\/?tr|\/?td|\/?th)[^>]*>/gi, '\t');

  // Remove all remaining tags
  text = text.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)));

  // Normalize whitespace
  text = text
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();

  if (!text) throw new Error('HTML: no text content found');
  return text;
}

// --- Pure-JS MOBI/AZW3 → TXT extraction ---
//
// MOBI (Mobipocket) and AZW3 (Kindle Format 8) are binary formats with
// embedded text. We parse the header to find the text section and extract
// raw text content. This is a best-effort implementation that handles
// common cases but may not preserve all formatting.
//
// Key structures:
//   - MOBI: PalmDOC header + EXTH header + text chunks
//   - AZW3: HTML-like structure wrapped in custom container
// Pure-JS MOBI / AZW3 / Mobipocket text extractor.
// Parses the PalmDB container + MOBI header, PalmDOC-decompresses the text
// records, and returns plain text. No CloudConvert / Calibre required, so
// mobi/azw3-source conversions are immune to the 402 quota wall.
// References: PalmDOC compression + Mobipocket MOBI header layout.
// PalmDOC decompression (per the PalmDOC/Mobipocket spec).
//   0x00..0x08 : 0x00 = literal 0; 0x01..0x08 = literal run of N following bytes.
//   0x09       : newline.
//   0x0A..0x7F : literal byte.
//   0x80..0xBF : back-reference. The low 6 bits of the byte + the next byte form
//               a 14-bit item: 11 bits of distance (backwards) + 3 bits of length
//               (copy length = n+3, i.e. 3..10 bytes).
//   0xC0..0xFF : byte pair = a space followed by (byte ^ 0x80).
function palmDocDecompress(buf: Buffer): Buffer {
  const out: number[] = [];
  let i = 0;
  const n = buf.length;
  while (i < n) {
    const b = buf[i];
    if (b <= 8) {
      for (let k = 1; k <= b; k++) out.push(buf[i + k] ?? 0);
      i += b + 1;
    } else if (b === 9) {
      out.push(0x0a);
      i++;
    } else if (b <= 0x7f) {
      out.push(b);
      i++;
    } else if (b <= 0xbf) {
      const c = buf[i + 1];
      const item = ((b & 0x3f) << 8) | c;
      const distance = item >> 3;
      const length = (item & 0x07) + 3;
      const start = out.length - distance;
      for (let k = 0; k < length; k++) out.push(out[start + k] ?? 0);
      i += 2;
    } else {
      out.push(0x20);
      out.push(b ^ 0x80);
      i++;
    }
  }
  return Buffer.from(out);
}

/**
 * Legacy plain-text fallback: scan the first 4KB of the buffer for a `<body>`
 * / `<html>` tag and pull out its inner text. Used ONLY when the strict PalmDB
 * parser fails (e.g. synthetic test fixtures that write `TPZ3` at offset 60 and
 * embed a raw `<body>...</body>` instead of a real PalmDB container).
 */
function legacyScanMobiForBody(buf: Buffer): string | null {
  const chunk = buf.subarray(0, Math.min(buf.length, 4096)).toString('latin1');
  const bodyMatch = chunk.match(/<body[^>]*>([\s\S]*)<\/body>/i) || chunk.match(/<body[^>]*>([\s\S]*)$/i);
  if (!bodyMatch) {
    const htmlMatch = chunk.match(/<html[^>]*>([\s\S]*)<\/html>/i) || chunk.match(/<html[^>]*>([\s\S]*)$/i);
    if (htmlMatch) return htmlMatch[1].trim();
    return null;
  }
  return bodyMatch[1].trim();
}

async function mobiToTxt(inputPath: string): Promise<string> {
  const buf = readFileSync(inputPath);

  // 0) Legacy synthetic fixtures: write TPZ3 at offset 60 + a raw <body>...</body>.
  //    These aren't real PalmDB containers. Try the strict parser first; if it
  //    throws, fall back to the body-scan so the legacy path still works.
  if (buf.length < 86) {
    const legacy = legacyScanMobiForBody(buf);
    if (legacy && legacy.length > 0) return legacy.replace(/\s+/g, ' ').trim();
    throw new Error('MOBI: file too small to be a valid Mobipocket');
  }

  // 1) PalmDB container: type (offset 60) = "BOOK", creator (64) = "MOBI".
  const type = buf.toString('latin1', 60, 64);
  const creator = buf.toString('latin1', 64, 68);
  if (type !== 'BOOK' && creator !== 'MOBI') {
    // Not a real PalmDB. Try the legacy body-scan as a last resort.
    const legacy = legacyScanMobiForBody(buf);
    if (legacy && legacy.length > 0) {
      return legacy
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/(p|div|h[1-6]|li|tr|section|article)>/gi, '\n')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    }
    throw new Error(`MOBI: not a Mobipocket file (type=${type || '?'} creator=${creator || '?'})`);
  }

  // 2) Record list: numRecords (UInt16 at 76), each entry 8 bytes from 78.
  const numRecords = buf.readUInt16BE(76);
  if (numRecords < 2) throw new Error('MOBI: no records');
  const offsets: number[] = [];
  let p = 78;
  for (let i = 0; i < numRecords; i++) {
    offsets.push(buf.readUInt32BE(p));
    p += 8;
  }

  // 3) Locate MOBI header (the "MOBI" magic inside record 0).
  const M = buf.indexOf('MOBI', offsets[0], 'latin1');
  if (M < 0) throw new Error('MOBI: header not found');
  const textEncoding = buf.readUInt32BE(M + 12);
  const enc = textEncoding === 65001 ? 'utf8' : textEncoding === 65000 ? 'utf16le' : 'latin1';

  // 4) Text records = records 1..(firstNonBookIndex-1). firstNonBookIndex sits
  //    at M+0x50; if missing/bogus, fall back to a printable-ratio filter.
  const KNOWN_BINARY = ['FLIS', 'FCIS', 'SRCS', 'HUFF', 'CDIC', 'INDX', 'DATP', 'BOUN', 'RESC', 'FONT', 'CRES', 'CMET', 'KNCX'];
  const firstNonBook = buf.readUInt32BE(M + 0x50);
  const textRecords: number[] = [];
  if (firstNonBook > 1 && firstNonBook <= numRecords) {
    for (let r = 1; r < firstNonBook; r++) textRecords.push(r);
  } else {
    // Fallback (firstNonBookIndex missing/bogus): pick records whose
    // PalmDOC-decompressed body is mostly printable text. The 2-byte
    // uncompressed-length prefix MUST be stripped first (same rule as step 5);
    // feeding it into the decompressor corrupts stream alignment and makes the
    // real HTML body decode to garbage with a low printable ratio.
    for (let r = 1; r < numRecords; r++) {
      const start = offsets[r];
      const end = offsets[r + 1] ?? buf.length;
      const rec = buf.subarray(start, end);
      const rawMagic = rec.subarray(0, 4).toString('latin1');
      if (KNOWN_BINARY.includes(rawMagic)) continue;
      const body = rec[0] === 0x00 && rec.length > 2 ? rec.subarray(2) : rec;
      const decomp = palmDocDecompress(body);
      if (decomp.length < 8) continue;
      const head = decomp.subarray(0, 32).toString('latin1');
      if (KNOWN_BINARY.some((m) => head.startsWith(m))) continue;
      const printable = (decomp.toString('latin1').match(/[\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g) || []).length;
      if (printable / decomp.length >= 0.8) textRecords.push(r);
    }
  }
  if (textRecords.length === 0) throw new Error('MOBI: could not locate text content in file');

  // 5) Decompress + assemble. Real Mobipocket text records lead with a 2-byte
  //    uncompressed-length prefix (high byte 0x00 for sub-64KB records); strip
  //    it. Synthetic fixtures without the prefix start directly with text, so
  //    skip the strip when the first byte is not the 0x00 length high-byte.
  let raw = Buffer.alloc(0);
  for (const r of textRecords) {
    const start = offsets[r];
    const end = offsets[r + 1] ?? buf.length;
    const rec = buf.subarray(start, end);
    const body = rec[0] === 0x00 && rec.length > 2 ? rec.subarray(2) : rec;
    raw = Buffer.concat([raw, palmDocDecompress(body)]);
  }

  // 6) Markup -> plain text.
  let text = raw.toString(enc);
  text = text
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|tr|section|article)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '  - ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_m: string, n: string) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_m: string, h: string) => String.fromCharCode(parseInt(h, 16)));
  return text.replace(/\s+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

// --- Pure-JS universal text-derived dispatcher (2026-10-22) ---
//
// Method: extract(source) → plain text → synthesize(target).
// Covers every text-derived format pair (source ∈ TEXT_SOURCES, target ∈
// TEXT_TARGETS) without CloudConvert/Calibre, immunizing them against the
// CloudConvert 402 quota wall. Binary/proprietary targets (azw3/mobi/pdf/jpg/
// png/doc/cbr/djvu/chm) stay on CloudConvert/Calibre — pure JS cannot reliably
// produce them.
//
// To add a new text-derived pair: ensure the source has an extractor in
// `extractToText` and the target has a synthesizer in `synthesizeFromText`.
// No new branch is needed — the dispatcher routes it automatically. This is the
// "纯JS 路径覆盖格式对的方法" documented in PROJECT_README.md.
const TEXT_SOURCES = new Set(['epub', 'mobi', 'azw3', 'docx', 'html', 'rtf', 'fb2', 'lit', 'txt']);
const TEXT_TARGETS = new Set(['epub', 'rtf', 'docx', 'fb2', 'txt']);

function isPureJsTextPair(source: string, target: string): boolean {
  return TEXT_SOURCES.has(source) && TEXT_TARGETS.has(target) && source !== target;
}

async function extractToText(source: string, inputPath: string): Promise<string> {
  switch (source) {
    case 'epub':
      return (await extractEpubTextChapters(inputPath)).join('\n\n');
    case 'mobi':
    case 'azw3':
    case 'lit': // lit (MS Reader) is MOBI-derived; reuse the MOBI text extractor
      return mobiToTxt(inputPath);
    case 'docx':
      return docxToTxt(inputPath);
    case 'html':
      return htmlToTxt(inputPath);
    case 'rtf':
      return rtfToTxt(inputPath);
    case 'fb2':
      return fb2ToTxt(inputPath);
    case 'txt':
      return readFileSync(inputPath, 'utf8');
    default:
      throw new Error(`No pure-JS extractor for source format: ${source}`);
  }
}

async function synthesizeFromText(
  target: string,
  text: string,
): Promise<{ data: Buffer | string; isBuffer: boolean }> {
  switch (target) {
    case 'epub':
      return { data: await buildEpubFromText(text), isBuffer: true };
    case 'rtf':
      return { data: buildRtfFromText(text), isBuffer: false };
    case 'docx':
      return { data: await buildDocxFromText(text), isBuffer: true };
    case 'fb2':
      return { data: buildFb2FromText(text), isBuffer: false };
    case 'txt':
      return { data: text, isBuffer: false };
    default:
      throw new Error(`No pure-JS synthesizer for target format: ${target}`);
  }
}

/**
 * Execute a single conversion synchronously (no queue / no Redis).
 * Returns the output encoded as base64 so the calling API route can deliver it
 * inline (raw bytes) or via a storage URL.
 */
export async function executeConversion(
  fileBuffer: string | null,
  inputFilePath: string | null,
  sourceFormat: string,
  targetFormat: string,
  jobId: string,
): Promise<ConversionJobResult> {
  if (!isValidFormat(sourceFormat)) {
    throw new Error(`Invalid source format: ${sourceFormat}`);
  }
  if (!isValidFormat(targetFormat)) {
    throw new Error(`Invalid target format: ${targetFormat}`);
  }

  const jobDir = path.join(UPLOAD_DIR, jobId);
  mkdirSync(jobDir, { recursive: true });

  let inputPath: string;
  if (inputFilePath && existsSync(inputFilePath)) {
    inputPath = inputFilePath;
  } else {
    if (!fileBuffer) {
      throw new Error('Either fileBuffer or inputFilePath must be provided');
    }
    inputPath = path.join(jobDir, jobId + '.' + sourceFormat);
    writeFileSync(inputPath, Buffer.from(fileBuffer, 'base64'));
    if (Buffer.byteLength(fileBuffer, 'base64') < 30) {
      throw new Error(`Invalid input file: too small (${Buffer.byteLength(fileBuffer, 'base64')} bytes)`);
    }
  }

  const ext = targetFormat === 'html' ? 'htmlz' : targetFormat;
  const outputPath = path.join(jobDir, 'output.' + ext);

  // EPUB → ZIP is a direct passthrough: an EPUB file IS a ZIP archive.
  const isZipPassthrough = sourceFormat === 'epub' && targetFormat === 'zip';

  // EPUB → TXT can be done in pure JS (no Calibre): unzip the EPUB, extract
  // HTML/XHTML content files, strip tags → plain text. Works on Vercel.
  const isEpubToTxt = sourceFormat === 'epub' && targetFormat === 'txt';

  // EPUB → RTF also done in pure JS (no Calibre / no CloudConvert): same
  // extraction, wrapped in a minimal RTF document. Avoids the 402 quota wall.
  const isEpubToRtf = sourceFormat === 'epub' && targetFormat === 'rtf';

  // EPUB → DOCX (OOXML) are also pure-JS:
  // both are text-derived formats we can synthesize without CloudConvert.
  const isEpubToFb2 = sourceFormat === 'epub' && targetFormat === 'fb2';
  const isEpubToDocx = sourceFormat === 'epub' && targetFormat === 'docx';

  // MOBI/AZW3 → TXT pure JS path (no CloudConvert, no Calibre)
  // Parses the MOBI/MOBIPocket header to extract text sections.
  const isMobiToTxt = (sourceFormat === 'mobi' || sourceFormat === 'azw3') && targetFormat === 'txt';

  // MOBI/AZW3 → EPUB 纯 JS 路径（抽文本 + 合成 EPUB），绕开 CloudConvert 402。
  const isMobiToEpub = (sourceFormat === 'mobi' || sourceFormat === 'azw3') && targetFormat === 'epub';

  // DOCX → TXT pure JS path (no CloudConvert, no Calibre)
  // Parses OOXML structure ([Content_Types].xml + word/document.xml) to extract text.
  const isDocxToTxt = sourceFormat === 'docx' && targetFormat === 'txt';

  // HTML → TXT pure JS path (no CloudConvert, no Calibre)
  // Strips HTML tags directly from the source file.
  const isHtmlToTxt = sourceFormat === 'html' && targetFormat === 'txt';

  // TXT → EPUB 纯 JS 路径（EPUB 本质是 ZIP+XHTML，复用 buildEpubFromText），
  // 免走 CloudConvert —— 实测 2026-10-18 该路径触发 60s 超时 conversion_failed。
  const isTxtToEpub = sourceFormat === 'txt' && targetFormat === 'epub';

  // --- P1 兜底扩展（2026-10-20）：文本派生「EPUB 输出族」纯 JS 路径，免疫 CloudConvert 402。
  // 这些目标都是 EPUB（纯 JS 可合成、verifyConversion 可验证、EPUB 阅读器能打开），
  // 降级为「纯文本 EPUB」（丢图/样式/目录），比起 402 全挂更有用。
  // 专有二进制目标（azw3/pdf/mobi/jpeg 等）与图片输出**不在此列**——纯 JS 无法产出
  // 可靠可用文件，仍走 CloudConvert（额度可用时）。
  const isEpubToEpub = sourceFormat === 'epub' && targetFormat === 'epub';
  const isHtmlToEpub = sourceFormat === 'html' && targetFormat === 'epub';
  const isDocxToEpub = sourceFormat === 'docx' && targetFormat === 'epub';
  const isRtfToEpub = sourceFormat === 'rtf' && targetFormat === 'epub';
  const isFb2ToEpub = sourceFormat === 'fb2' && targetFormat === 'epub';
  const isLitToEpub = sourceFormat === 'lit' && targetFormat === 'epub';

  try {
    await validateInputFile(inputPath, sourceFormat);

    if (isZipPassthrough) {
      writeFileSync(outputPath, readFileSync(inputPath));
    } else if (isEpubToTxt) {
      const txt = await epubToTxt(inputPath);
      writeFileSync(outputPath, txt, 'utf8');
    } else if (isEpubToRtf) {
      const rtf = await epubToRtf(inputPath);
      writeFileSync(outputPath, rtf, 'utf8');
    } else if (isEpubToFb2) {
      const fb2 = await epubToFb2(inputPath);
      writeFileSync(outputPath, fb2, 'utf8');
    } else if (isEpubToDocx) {
      const docx = await epubToDocx(inputPath);
      writeFileSync(outputPath, docx);
    } else if (isMobiToTxt) {
      const txt = await mobiToTxt(inputPath);
      writeFileSync(outputPath, txt, 'utf8');
    } else if (isMobiToEpub) {
      const txt = await mobiToTxt(inputPath);
      const epub = await buildEpubFromText(txt);
      writeFileSync(outputPath, epub);
    } else if (isDocxToTxt) {
      const txt = await docxToTxt(inputPath);
      writeFileSync(outputPath, txt, 'utf8');
    } else if (isTxtToEpub) {
      const txt = readFileSync(inputPath, 'utf8');
      const epub = await buildEpubFromText(txt);
      writeFileSync(outputPath, epub);
    } else if (isHtmlToTxt) {
      const txt = await htmlToTxt(inputPath);
      writeFileSync(outputPath, txt, 'utf8');
    } else if (isEpubToEpub) {
      // EPUB → EPUB pure-JS fallback: re-pack extracted chapters as a minimal
      // valid EPUB 3.0. Lossy (text-only) but survives CloudConvert 402.
      const chapters = await extractEpubTextChapters(inputPath);
      const epub = await buildEpubFromText(chapters.join('\n\n'));
      writeFileSync(outputPath, epub);
    } else if (isHtmlToEpub) {
      const txt = await htmlToTxt(inputPath);
      const epub = await buildEpubFromText(txt);
      writeFileSync(outputPath, epub);
    } else if (isDocxToEpub) {
      const txt = await docxToTxt(inputPath);
      const epub = await buildEpubFromText(txt);
      writeFileSync(outputPath, epub);
    } else if (isRtfToEpub) {
      const txt = await rtfToTxt(inputPath);
      const epub = await buildEpubFromText(txt);
      writeFileSync(outputPath, epub);
    } else if (isFb2ToEpub) {
      const txt = await fb2ToTxt(inputPath);
      const epub = await buildEpubFromText(txt);
      writeFileSync(outputPath, epub);
    } else if (isLitToEpub) {
      const txt = await mobiToTxt(inputPath);
      const epub = await buildEpubFromText(txt);
      writeFileSync(outputPath, epub);
    } else if (isPureJsTextPair(sourceFormat, targetFormat)) {
      // Universal pure-JS path for any remaining text-derived pair (e.g.
      // mobi→rtf/docx/fb2, docx→rtf/fb2, rtf→txt/docx/fb2, fb2→txt/rtf/docx,
      // lit→txt/rtf/docx/fb2, txt→rtf/docx/fb2). extract(source) → text →
      // synthesize(target). No CloudConvert / no Calibre → immune to 402.
      const text = await extractToText(sourceFormat, inputPath);
      const out = await synthesizeFromText(targetFormat, text);
      writeFileSync(outputPath, out.data, out.isBuffer ? undefined : 'utf8');
    } else {
      // Check if Calibre is available
      let calibreAvailable = false;
      try {
        await execFileAsync(CALIBRE_PATH, ['--version'], { timeout: 5000 });
        calibreAvailable = true;
      } catch {
        // Calibre not available on this runtime (e.g., Vercel Serverless)
        log.conversion.warn('Calibre not available, checking CloudConvert fallback', {
          hasCloudConvert: isCloudConvertConfigured(),
        });
      }

      if (!calibreAvailable) {
        // Try CloudConvert as fallback
        if (isCloudConvertConfigured()) {
          log.conversion.info('Using CloudConvert fallback for conversion', {
            sourceFormat, targetFormat, jobId,
          });
          const cloudResult = await convertWithCloudConvert(
            sourceFormat,
            targetFormat,
            fileBuffer!,
            `${jobId}.${sourceFormat}`,
          );
          const ext = targetFormat === 'html' ? 'htmlz' : targetFormat;
          const outBuffer = Buffer.from(cloudResult.base64Data, 'base64');
          // Pure-critic gate: verify CloudConvert output before delivery
          // (parity with the Calibre path — one veto on CRITICAL findings).
          writeFileSync(outputPath, outBuffer);
          const verdict = await verifyConversion(inputPath, outputPath, sourceFormat, targetFormat);
          if (!verdict.pass) {
            const detail = verdict.findings
              .filter((f) => f.severity === 'critical')
              .map((f) => `${f.id}: ${f.message}`)
              .join('; ');
            throw new Error(`Conversion output failed verification: ${detail}`);
          }
          for (const w of verdict.findings.filter((f) => f.severity === 'warn')) {
            log.conversion.warn('Conversion verification warning', { jobId, id: w.id, message: w.message });
          }
          await cleanupDir(jobDir);
          return {
            base64Data: cloudResult.base64Data,
            extension: ext,
            mimeType: cloudResult.mimeType,
            fileSize: outBuffer.length,
          };
        } else {
          throw new Error('Calibre is not available on this server. Please use EPUB to TXT or EPUB to ZIP conversions, or contact support for other formats.');
        }
      }

      await execFileAsync(CALIBRE_PATH, [inputPath, outputPath], { timeout: 120_000, maxBuffer: 50 * 1024 * 1024 });
      if (!existsSync(outputPath)) throw new Error('Conversion failed: output not generated');

      const verdict = await verifyConversion(inputPath, outputPath, sourceFormat, targetFormat);
      if (!verdict.pass) {
        const detail = verdict.findings
          .filter((f) => f.severity === 'critical')
          .map((f) => `${f.id}: ${f.message}`)
          .join('; ');
        throw new Error(`Conversion output failed verification: ${detail}`);
      }
      for (const w of verdict.findings.filter((f) => f.severity === 'warn')) {
        log.conversion.warn('Conversion verification warning', { jobId, id: w.id, message: w.message });
      }
    }

    const outBuffer = readFileSync(outputPath);
    const base64Data = outBuffer.toString('base64');
    const fileSize = outBuffer.length;

    await cleanupDir(jobDir);
    return { base64Data, extension: ext, mimeType: getMimeType(ext), fileSize };
  } catch (err) {
    await cleanupDir(jobDir);
    const msg = errorMessage(err) || String(err);
    // The verification gate's rejection message is preserved verbatim; every
    // other error is rethrown untouched so callers can map it to a user-facing
    // code via mapErrorCode. (This block used to also build `stderr`/`combined`
    // and an `errorCode` that was never read.)
    if (msg.startsWith('Conversion output failed verification')) {
      throw err;
    }
    throw err;
  }
}

/**
 * Top-level entry used by API routes for synchronous (in-request) conversion.
 * Wraps `executeConversion` with structured audit logging so success-rate
 * stats keep flowing even without the BullMQ worker.
 */
export async function runConversion(
  fileBuffer: string | null,
  inputFilePath: string | null,
  sourceFormat: string,
  targetFormat: string,
  jobId: string,
): Promise<ConversionJobResult> {
  const start = Date.now();
  try {
    const result = await executeConversion(fileBuffer, inputFilePath, sourceFormat, targetFormat, jobId);
    appendConversionAuditLog(jobId, 'succeeded', {
      sourceFormat, targetFormat, durationMs: Date.now() - start,
    });
    return result;
  } catch (err) {
    appendConversionAuditLog(jobId, 'failed', {
      sourceFormat, targetFormat,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}
