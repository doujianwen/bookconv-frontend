import type { BlogPostMeta } from "./types";
import * as post1 from "./how-to-convert-epub-to-mobi";
import * as post2 from "./ebook-formats-explained";
import * as post3 from "./why-convert-lit-to-epub";
import * as post4 from "./how-to-convert-epub-to-mobi-en";
import * as post5 from "./ebook-formats-explained-en";
import * as post6 from "./why-convert-lit-to-epub-en";

const posts: BlogPostMeta[] = [post1, post2, post3, post4, post5, post6] as BlogPostMeta[];

export function getAllPosts(): BlogPostMeta[] {
  return [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPostMeta | undefined {
  return posts.find(p => p.slug === slug);
}

export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  posts.forEach(p => p.tags.forEach(t => tagSet.add(t)));
  return [...tagSet].sort();
}

export function getPostsByTag(tag: string): BlogPostMeta[] {
  return posts.filter(p => p.tags.includes(tag));
}

export function searchPosts(query: string): BlogPostMeta[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return posts.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.content.intro.toLowerCase().includes(q) ||
    p.tags.some(t => t.toLowerCase().includes(q)) ||
    p.content.sections.some(s => s.body.toLowerCase().includes(q))
  );
}

export function buildPostSlugs(): string[] {
  return posts.map(p => p.slug);
}

// Re-export types for the detail page
export { extractHeadings, generateTocHtml, renderMarkdownToHtml, buildInternalLinks } from "./types";
