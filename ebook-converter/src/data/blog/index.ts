import type { BlogPostMeta } from "./types";
import * as post1 from "./how-to-convert-epub-to-mobi-en";
import * as post2 from "./ebook-formats-explained-en";
import * as post3 from "./why-convert-lit-to-epub-en";
import * as post4 from "./epub-to-mobi-guide";
import * as post5 from "./pdf-to-epub-guide";
import * as post6 from "./download-troubleshooting";
import * as post7 from "./background-workers";
import * as post8 from "./env-variables-setup";
import * as post9 from "./webhook-integration";
import * as post10 from "./sitemap-seo-guide";

// 保留英文版（正文英文）。中文版（how-to-convert-epub-to-mobi / ebook-formats-explained /
// why-convert-lit-to-epub，正文为中文）已按需求删除。
// 另含 codex 生成的 7 篇英文指南（epub-to-mobi-guide 等，由 .mdx 转换而来）。
const posts: BlogPostMeta[] = [post1, post2, post3, post4, post5, post6, post7, post8, post9, post10] as BlogPostMeta[];

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
