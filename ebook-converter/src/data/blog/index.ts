import type { BlogPostMeta } from "./types";
import * as post1 from "./how-to-convert-epub-to-mobi";
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
import * as post17 from "./epub-to-azw3";
import * as post18 from "./epub-to-word";
import * as post19 from "./txt-to-epub";
import * as post20 from "./mobi-to-epub";

// Keep the English versions (English body). The Chinese versions
// (how-to-convert-epub-to-mobi / ebook-formats-explained / why-convert-lit-to-epub,
// Chinese body) were deleted per request.
// Also includes 7 codex-generated English guides (epub-to-mobi-guide etc., converted from .mdx).
const posts: BlogPostMeta[] = [post1, post2, post3, post4, post5, post6, post7, post8, post9, post10, post11, post12, post13, post14, post15, post16, post17, post18, post19, post20] as BlogPostMeta[];

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
