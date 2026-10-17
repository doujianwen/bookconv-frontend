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

/** Validate input file before sending to Calibre. Throws if the file is clearly corrupted. */
async function validateInputFile(inputPath: string, sourceFormat: string): Promise<void> {
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

function plainTextToRtfBody(text: string): string {
  return rtfEscape(text)
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n/g, '\\par ');
}

function buildRtf(chapters: string[]): string {
  const body = chapters.map(plainTextToRtfBody).join('\\par\\par ---\\par\\par ');
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
  return buildRtf(chapters);
}

// --- Pure-JS EPUB → FB2 (FictionBook 2.1, plain XML) ---
//
// FB2 is a single XML document. We wrap the extracted chapters in a minimal
// valid FictionBook 2.1 body. No Calibre / no CloudConvert → immune to 402.
async function epubToFb2(inputPath: string): Promise<string> {
  const chapters = await extractEpubTextChapters(inputPath);
  const sections = chapters
    .map((ch) => {
      const paras = ch
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => `      <p>${xmlEscape(p)}</p>`)
        .join('\n');
      return `    <section>\n${paras}\n    </section>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<FictionBook xmlns="http://www.gribuser.ru/xml/fictionbook/2.1">
  <description>
    <title-info>
      <book-title>Converted Document</book-title>
    </title-info>
  </description>
  <body>
${sections}
  </body>
</FictionBook>`;
}

// --- Pure-JS EPUB → DOCX (minimal OOXML, zip of XML parts) ---
//
// A DOCX is just a ZIP of well-known XML parts. We build the smallest valid
// set (content-types, relationships, word/document.xml) with jszip so Word can
// open it. No Calibre / no CloudConvert → immune to 402.
async function epubToDocx(inputPath: string): Promise<Buffer> {
  const JSZip = (await import('jszip')).default;
  const chapters = await extractEpubTextChapters(inputPath);
  const paragraphs = chapters
    .flatMap((ch) =>
      ch
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map(
          (p) =>
            `        <w:p><w:r><w:t xml:space="preserve">${xmlEscape(p)}</w:t></w:r></w:p>`,
        ),
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
async function mobiToTxt(inputPath: string): Promise<string> {
  const data = readFileSync(inputPath);

  // Try to detect if this is AZW3 (KF8) or legacy MOBI
  const isAzw3 = data.subarray(60, 64).toString('latin1') === 'TPZ3';

  if (isAzw3) {
    // AZW3/KF8: Look for HTML content
    // The text is typically embedded in the file after the header
    let text = '';

    // Scan for <body>...</body> patterns (HTML content)
    const bodyMatch = data.toString('latin1').match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      let html = bodyMatch[1];
      // Strip HTML tags
      html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
      html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
      html = html.replace(/<br\s*\/?>/gi, '\n');
      html = html.replace(/<\/(p|div|h[1-6]|li|tr)>/gi, '\n');
      html = html.replace(/<li[^>]*>/gi, '  - ');
      html = html.replace(/<[^>]+>/g, '');
      html = html.replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
        .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
      text = html.replace(/\n{3,}/g, '\n\n').trim();
    }

    if (text) return text;
    throw new Error('AZW3: no extractable text content found');
  }

  // Legacy MOBI (PalmDOC)
  // Parse EXTH header to find text offsets
  let textOffset = -1;
  let textLength = -1;

  // Check for EXTH header (starts at offset 0x80)
  const exthMarker = data.subarray(0x80, 0x84).toString('utf8');
  if (exthMarker === 'EXTH') {
    const exthLength = data.readUInt32BE(0x84);
    // Scan for known EXTH tags
    for (let i = 0x88; i < 0x88 + exthLength - 8; i += 8) {
      const tag = data.readUInt32BE(i);
      const length = data.readUInt32BE(i + 4);
      if (tag === 1009 && i + 8 + 4 <= data.length) {
        textOffset = data.readUInt32BE(i + 8);
      }
      if (tag === 1010 && i + 8 + 4 <= data.length) {
        textLength = data.readUInt32BE(i + 8);
      }
    }
  }

  // Fallback: scan for text region
  if (textOffset < 0 || textLength <= 0) {
    // Try to find text after the header (typically after 0x100)
    const headerEnd = Math.min(0x1000, data.length);
    const headerStr = data.subarray(0, headerEnd).toString('latin1');

    // Look for <DOCTYPE or <html or <body markers
    const htmlMatch = headerStr.match(/<(?:DOCTYPE|html|body)[^>]*>/i);
    if (htmlMatch) {
      const startIdx = headerStr.indexOf(htmlMatch[0]);
      const contentStart = startIdx + htmlMatch[0].length;
      // Extract text until we hit non-text characters
      let endIdx = contentStart;
      while (endIdx < data.length && endIdx < contentStart + 10 * 1024 * 1024) {
        const byte = data[endIdx];
        // Stop at null bytes or non-printable characters (except common whitespace)
        if (byte === 0 || (byte < 32 && byte !== 10 && byte !== 13 && byte !== 9)) {
          break;
        }
        endIdx++;
      }

      if (endIdx > contentStart) {
        textOffset = contentStart;
        textLength = endIdx - contentStart;
      }
    }
  }

  if (textOffset < 0 || textLength <= 0) {
    throw new Error('MOBI: could not locate text content in file');
  }

  // Extract and decode text
  const rawText = data.subarray(textOffset, textOffset + textLength).toString('latin1');

  // Try UTF-8 first, fall back to Windows-1252
  let text: string;
  try {
    // Check for BOM
    if (rawText.startsWith('\ufeff')) {
      text = rawText.slice(1);
    } else {
      // Try to interpret as UTF-8
      text = Buffer.from(rawText, 'binary').toString('utf8');
      // Validate - if it contains replacement characters, try Latin1
      if (text.includes('\ufffd')) {
        text = rawText;
      }
    }
  } catch {
    text = rawText;
  }

  // Strip any remaining markup
  text = text.replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

  return text;
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

  // DOCX → TXT pure JS path (no CloudConvert, no Calibre)
  // Parses OOXML structure ([Content_Types].xml + word/document.xml) to extract text.
  const isDocxToTxt = sourceFormat === 'docx' && targetFormat === 'txt';

  // HTML → TXT pure JS path (no CloudConvert, no Calibre)
  // Strips HTML tags directly from the source file.
  const isHtmlToTxt = sourceFormat === 'html' && targetFormat === 'txt';

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
    } else if (isDocxToTxt) {
      const txt = await docxToTxt(inputPath);
      writeFileSync(outputPath, txt, 'utf8');
    } else if (isHtmlToTxt) {
      const txt = await htmlToTxt(inputPath);
      writeFileSync(outputPath, txt, 'utf8');
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
