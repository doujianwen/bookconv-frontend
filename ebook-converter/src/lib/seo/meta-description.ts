/**
 * 单一权威点：把 meta description 截断到 Bing/Google 安全区（≤160 字符）。
 *
 * 为什么存在：Bing URL 检查的 SEO 分析器对「Meta Description 太长或太短」报错误级
 * （合理区间 25-160 字符）。2026-10-15 全站审计发现 162 页中 100 页超长——
 * blog 页用 content.intro（整段首段，最长 964 字符）、guide 页用 g.problem
 * 直接当 description 且无截断。此 helper 是唯一截断点，各 generateMetadata 调用。
 *
 * 截断策略：优先在最后一个完整句号/问号/叹号处截断（保留自然语感）；
 * 单句超长时退化到最后一个空格处硬截并加省略号，避免截断到单词中间。
 *
 * @param text 原始 description 候选文本
 * @param max 最大长度（默认 158，给渲染器留余量）
 */
export function clampMetaDescription(text: string | undefined | null, max = 158): string {
  const raw = (text ?? '')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1') // [text](url) → text
    .replace(/\*\*([^*]+)\*\*/g, '$1')        // **bold** → bold
    .replace(/__([^_]+)__/g, '$1')            // __bold__ → bold
    .replace(/`([^`]+)`/g, '$1')              // `code` → code
    .replace(/^\s*[*>-]\s+/gm, '')            // list bullets / blockquote
    .replace(/^#{1,6}\s+/gm, '')              // heading markers
    .replace(/&amp;/g, '&')                   // normalize entities (React re-escapes on render)
    .replace(/\s+/g, ' ')
    .trim();
  if (raw.length <= max) return raw;

  const slice = raw.slice(0, max);
  // 优先在完整句末截断（句号/问号/叹号后跟空格或结尾）
  const sentenceEnd = Math.max(
    slice.lastIndexOf('. '),
    slice.lastIndexOf('? '),
    slice.lastIndexOf('! '),
  );
  if (sentenceEnd >= 60) return slice.slice(0, sentenceEnd + 1);
  // 退化：在最后一个空格截断，避免断词
  const lastSpace = slice.lastIndexOf(' ');
  return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice).replace(/[,;:—-]+$/, '') + '…';
}
