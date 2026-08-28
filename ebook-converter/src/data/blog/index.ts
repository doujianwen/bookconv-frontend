import type { BlogPostMeta } from "./types";
import * as post2 from "./ebook-formats-explained";
import * as post3 from "./why-convert-lit-to-epub";
import * as post4 from "./epub-to-mobi-guide";
import * as post5 from "./pdf-to-epub-guide";
import * as post6 from "./download-troubleshooting";
import * as post7 from "./background-workers";
import * as post8 from "./env-variables-setup";
import * as post9 from "./webhook-integration";
import * as post10 from "./sitemap-seo-guide";
import * as post11 from "./azw3-vs-mobi";
import * as post12 from "./epub-to-pdf-linux";
import * as post13 from "./lit-ebook-format";
import * as post14 from "./djvu-to-pdf";
import * as post15 from "./cbr-to-pdf";
import * as post16 from "./fb2-to-epub";
import * as post18 from "./epub-to-word";
import * as post19 from "./txt-to-epub";
import * as post20 from "./mobi-to-epub";
import * as post22 from "./can-kindle-read-azw3";
import * as post23 from "./mobi-to-kobo";
import * as post24 from "./epub-vs-mobi";
import * as post25 from "./batch-converter";
import * as post26 from "./epub-vs-pdf";
import * as post27 from "./why-ebook-wont-open-kindle";
import * as post29 from "./common-ebook-format-problems";
import * as post30 from "./fb2-vs-epub";
import * as post31 from "./ebook-conversion-checklist";
import * as post32 from "./read-epub-on-any-device";
import * as post33 from "./epub3-vs-epub2";
import * as post34 from "./scanned-pdf-to-epub-ocr";
import * as post35 from "./best-ebook-reader-apps";
import * as post36 from "./kobo-to-epub";
import * as post37 from "./conversion-error-guide";
import * as post38 from "./large-file-conversion-guide";
import * as post39 from "./check-converted-file-quality";
import * as post40 from "./sync-reading-across-devices";
import * as post41 from "./ebook-conversion-tools";
import * as post42 from "./epub-converter";
import * as post43 from "./azw3-epub-mobi-kindle-compatibility";
import * as post44 from "./epub-to-docx";
import * as post45 from "./epub-to-text";
import * as post46 from "./epub-to-various-other";
import * as post47 from "./ai-feeding-notebooklm-chatgpt";
import * as post50 from "./calibre-free-batch";
import * as post51 from "./ebook-troubleshooting";
import * as post52 from "./epub-to-mobi";
import * as post53 from "./epub-to-word-docx";
import * as post54 from "./kindle-epub-azw3-mobi";
import * as post56 from "./legacy-lit-djvu-fb2-converter";
import * as post57 from "./azw3-epub-mobi-kindle";
import * as post58 from "./layout-typesetting-pdf-epub";
import * as post59 from "./lit-format-conversion-and";
import * as post60 from "./selection-intercept-converter";
import * as post61 from "./sync-ebooks-reading-groups";

// Keep the English versions (English body). The Chinese versions
// (ebook-formats-explained / why-convert-lit-to-epub, Chinese body) were deleted per request.
// Also includes 7 codex-generated English guides (epub-to-mobi-guide etc., converted from .mdx).
// 2026-08-10: how-to-convert-epub-to-mobi (EN step-by-step) archived to ../_archived/ to dedupe
//   the "how to convert EPUB to MOBI" intent vs epub-to-mobi-guide; 301 in src/middleware.ts.
// 2026-08-11: epub-vs-azw3-vs-mobi archived to ../_archived/ — R1 cannibalization vs
//   ebook-formats-explained (near-identical title). 301 in src/middleware.ts BLOG_REDIRECTS.
// 2026-08-11: mobi-or-azw3-for-kindle archived to ../_archived/ — R2 cannibalization vs
//   azw3-vs-mobi (near-identical "mobi vs azw3 for kindle" intent). 301 in BLOG_REDIRECTS.
// 2026-08-11: epub-to-azw3 archived to ../_archived/ — R4 cannibalization vs
//   guide/epub-to-azw3-for-kindle (near-identical "EPUB to AZW3" how-to intent). 301 in BLOG_REDIRECTS.
// 2026-08-26: Batch published 12 GEO articles (kindle-epub-azw3-mobi, ebook-troubleshooting, etc.)
// 2026-08-27: Fixed 7 articles with double-brace escaping; removed 4 broken files (azw3-epub-mobi-kindle,
//   layout-typesetting-pdf-epub, lit-format-conversion-and, selection-intercept-converter) due to truncated
//   template literals. Remaining 8 new articles are functional.
// 2026-08-28: Added sync-ebooks-reading-groups (post61) — 深化 "多设备同步" 主题，乘 Bing AI 高 Share
//   机会词 "ebook syncing virtual reading groups" (42.86%) 与 "romance books sync" (45%)。
const posts: BlogPostMeta[] = [post2, post3, post4, post5, post6, post7, post8, post9, post10, post11, post12, post13, post14, post15, post16, post18, post19, post20, post22, post23, post24, post25, post26, post27, post29, post30, post31, post32, post33, post34, post35, post36, post37, post38, post39, post40, post41, post42, post43, post44, post45, post46, post47, post50, post51, post52, post53, post54, post56, post57, post58, post59, post60, post61] as BlogPostMeta[];

export function getAllPosts(): BlogPostMeta[] {
  return [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPostMeta | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  posts.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
  return [...tagSet].sort();
}

export function getPostsByTag(tag: string): BlogPostMeta[] {
  return posts.filter((p) => p.tags.includes(tag));
}

export function searchPosts(query: string): BlogPostMeta[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return posts.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.content.intro.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q)) ||
      p.content.sections.some((s) => s.body.toLowerCase().includes(q)),
  );
}

export function buildPostSlugs(): string[] {
  return posts.map((p) => p.slug);
}

// Re-export types for the detail page
export { extractHeadings, generateTocHtml, renderMarkdownToHtml, buildInternalLinks } from "./types";
