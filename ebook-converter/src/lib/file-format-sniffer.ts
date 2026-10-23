"use client";

// 上传前魔数嗅探（客户端）：在把文件 POST 到 /api/convert 之前，读取文件前 8
// 字节做"明显不是目标格式"的拦截，把后端的 500（CORRUPT_INPUT）提前成可即时
// 反馈的错误，省一次无效 API 调用 + 一次飞书告警。
//
// 设计原则（用户铁律：精准修改、绝不误杀真文件）：
//   1. 只识别"明确的非目标格式魔数"；识别不了（前 8 字节读不到/非已知魔数）就
//      直接放行（return null）——后端 validateInputFile 是最终权威校验，前端
//      嗅探是 best-effort 提示，宁可漏报绝不误杀。
//   2. 魔数识别表与 src/lib/conversion.ts 的 describeUnknownMagic 保持一致
//      （单一事实源原则），避免前后端识别标准漂移。
//   3. 纯客户端、无依赖、只读文件头，不触碰网络 / 不写文件。

export interface SniffResult {
  /** 文件真实类型的人类可读猜测（如「一个 SQLite 数据库文件（.db/.sqlite）」） */
  guess: string;
  /** 文件前 4 字节的十六进制（如 "8834d0a3"），用于后端告警 / 日志对照 */
  magicHex: string;
  /** 给用户看的可操作提示文案 */
  userMessage: string;
}

/**
 * 各目标源格式"正常文件"应有的魔数特征（命中任一即视为合法，直接放行）。
 * 与后端 conversion.ts / conversion-verifier.ts 的魔数判定对齐。
 */
const LEGIT_HEADS: Record<string, Array<(b: Uint8Array) => boolean> | null> = {
  // EPUB / DOCX / CBZ / FB2(zip) 都是 ZIP：PK\x03\x04 / PK\x05\x06 / PK\x07\x08
  epub: [(b) => b[0] === 0x50 && b[1] === 0x4b && (b[2] === 0x03 || b[2] === 0x05 || b[2] === 0x07)],
  docx: [(b) => b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03],
  zip: [(b) => b[0] === 0x50 && b[1] === 0x4b && (b[2] === 0x03 || b[2] === 0x05)],
  fb2: [
    // FB2 可能是 ZIP 归档，也可能是 XML 文本
    (b) => b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03,
    (b) => b[0] === 0x3c && b[1] === 0x3f, // <?xml
  ],
  // PDF
  pdf: [(b) => b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46], // %PDF
  // MOBI / AZW3：PalmDB，魔数在偏移 0 或偏移 60（BOOK / TEXt / TPZ3）。
  // 嗅探器只读 64 字节，偏移 60 的检查需 60-63 共 4 字节（≤64），故门槛用 >= 64。
  mobi: [
    (b) => latin1(b, 0, 4) === "BOOK" || latin1(b, 0, 4) === "TEXt",
    (b) => b.length >= 64 && (latin1(b, 60, 4) === "BOOK" || latin1(b, 60, 4) === "TEXt" || latin1(b, 60, 4) === "TPZ3"),
  ],
  azw3: [
    (b) => b.length >= 64 && latin1(b, 60, 4) === "TPZ3",
    (b) => latin1(b, 0, 4) === "BOOK",
  ],
  // TXT / RTF / HTML：纯文本类，前 8 字节多为可打印 ASCII（放行，让后端判）
  txt: null,
  rtf: null,
  html: null,
  // LIT / DOC：OLE 容器 D0 CF 11 E0
  lit: [(b) => b[0] === 0xd0 && b[1] === 0xcf && b[2] === 0x11 && b[3] === 0xe0],
  doc: [(b) => b[0] === 0xd0 && b[1] === 0xcf && b[2] === 0x11 && b[3] === 0xe0],
  // CBR：RAR Rar!
  cbr: [(b) => b[0] === 0x52 && b[1] === 0x61 && b[2] === 0x72 && b[3] === 0x21],
  // CBZ：ZIP
  cbz: [(b) => b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03],
  // DJVU：AT&T
  djvu: [(b) => b[0] === 0x41 && b[1] === 0x54 && b[2] === 0x26 && b[3] === 0x54],
};

function latin1(b: Uint8Array, off: number, len: number): string {
  if (b.length < off + len) return "";
  let s = "";
  for (let i = off; i < off + len; i++) s += String.fromCharCode(b[i]);
  return s;
}

/** 已知非电子书魔数 → 人类可读猜测（与 conversion.ts 的 KNOWN_MAGIC_HINTS 对齐） */
const KNOWN_MAGIC_HINTS: Record<string, string> = {
  "8834d0a3": "一个 SQLite 数据库文件（.db/.sqlite）",
  "53514c69": "一个 SQLite 数据库文件（SQLite 开头）",
  "25504446": "一个 PDF 文件（被改名为目标格式）",
  "3c444f43": "一段 HTML 网页（<DOC…）",
  "3c48544d": "一段 HTML 网页（<HTM…）",
  "3c3f786d": "一段 XML 文件（<?xm…）",
  "0d6a7372": "一个 RAR 压缩文件（Rar! 头）",
  "52617221": "一个 RAR 压缩文件（Rar! 头）",
  "1f8b0800": "一个 GZIP 压缩文件",
  "425a6800": "一个 BZ2 压缩文件（BZh…）",
  "377a6264": "一个 7-Zip 压缩文件（7z…）",
  "89504e47": "一个 PNG 图片文件",
  "ffd8ffe0": "一个 JPEG 图片文件",
  "ffd8ffe1": "一个 JPEG 图片文件",
  "47494638": "一个 GIF 图片文件",
};

/**
 * 嗅探上传文件是否"明显不是目标源格式"。
 * @returns 命中可疑魔数时返回 SniffResult（调用方应阻断上传）；合法/无法识别时返回 null（放行）。
 */
export async function sniffFileFormat(file: File, sourceFormat: string, isEs = false): Promise<SniffResult | null> {
  let head: Uint8Array;
  try {
    const buf = await file.slice(0, 64).arrayBuffer();
    head = new Uint8Array(buf);
  } catch {
    return null; // 读不到文件头 → 保守放行，交后端判定
  }
  if (head.length < 4) return null;

  // 1) 合法魔数白名单命中 → 放行
  const legit = LEGIT_HEADS[sourceFormat];
  if (legit && legit.some((pred) => pred(head))) {
    return null;
  }

  // 2) 纯文本类目标格式（txt/rtf/html）不做魔数拦截：这些格式本身无前导魔数，
  //    任何字节都可能是合法文本开头，误杀风险高。后端 validateInputFile 对
  //    txt/rtf 只查 rtf 的 {\ 前缀，前端不重复拦截。
  if (sourceFormat === "txt" || sourceFormat === "rtf" || sourceFormat === "html") {
    return null;
  }

  // 3) 翻译魔数 → 人类可读猜测
  const magicHex = bufToHex(head.slice(0, 4));
  const guess = KNOWN_MAGIC_HINTS[magicHex] || `无法识别的二进制文件（前 4 字节 0x${magicHex}）`;
  const targetDisplay = sourceFormat.toUpperCase();

  return {
    guess,
    magicHex,
    userMessage: isEs
      ? `El archivo que subiste parece ser «${guess}», no un ${targetDisplay} válido. Asegúrate de seleccionar el archivo .${targetDisplay.toLowerCase()} correcto (nota: los archivos .pdf/.txt/base de datos renombrados no se pueden convertir).`
      : `The file you uploaded looks like "${guess}", not a valid ${targetDisplay}. Please make sure you selected the correct .${targetDisplay.toLowerCase()} file (note: renamed .pdf/.txt/database files cannot be converted).`,
  };
}

function bufToHex(b: Uint8Array): string {
  let s = "";
  for (let i = 0; i < b.length; i++) s += b[i].toString(16).padStart(2, "0");
  return s;
}
