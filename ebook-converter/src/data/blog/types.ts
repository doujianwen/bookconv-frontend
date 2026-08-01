export interface BlogSection {
  heading: string;
  body: string;
}

export interface BlogPostContent {
  intro: string;
  sections: BlogSection[];
}

export interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;
  author?: string;
  tags: string[];
  content: BlogPostContent;
  relatedSlugs?: string[];
  internalLinkTargets?: string[];
}

export interface BlogPostWithLinks extends BlogPostMeta {
  relatedSlugs: string[];
  internalLinkTargets: string[];
}

export function extractHeadings(content: BlogPostContent): Array<{ id: string; text: string; level: number }> {
  const results: Array<{ id: string; text: string; level: number }> = [];

  if (content.intro) {
    results.push({ id: "intro", text: content.intro.slice(0, 50), level: 2 });
  }

  content.sections.forEach((section) => {
    const id = section.heading.toLowerCase()
      .replace(/[^\w\u4e00-\u9fff]+/g, "-")
      .replace(/(^-|-$)/g, "");
    results.push({ id, text: section.heading, level: 2 });
  });

  return results;
}

export function generateTocHtml(headings: Array<{ id: string; text: string; level: number }>): string {
  if (headings.length === 0) return "";

  let html = '<nav class="mb-8 rounded-xl border bg-gray-50 p-5" aria-label="Table of contents">';
  html += '<h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">On this page</h2>';
  html += '<ul class="space-y-1.5 text-sm">';

  headings.forEach((h) => {
    const indent = h.level === 2 ? "ml-0" : "ml-4";
    html += "<li class=\"" + indent + "\"><a href=\"#" + h.id + "\" class=\"text-blue-600 hover:text-blue-800 transition-colors\">" + h.text + "</a></li>";
  });

  html += "</ul></nav>";
  return html;
}

export function renderMarkdownToHtml(markdown: string): string {
  if (!markdown) return "";

  let html = markdown
    .replace(/\\\\n/g, "\n")
    .replace(/\\n/g, "\n");

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // Italic
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  // Inline code
  html = html.replace(/`(.+?)`/g, "<code class=\"rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono text-pink-600\">$1</code>");
  // Links
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener">$1</a>');
  // Unordered list items
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  // Ordered list items
  html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");
  // Wrap consecutive <li> in <ul>
  html = html.replace(/((?:<li>.*?<\/li>\n?)+)/g, '<ul class="list-disc pl-6 space-y-1.5">$1</ul>');
  // Paragraphs
  html = html.replace(/\n\n/g, "</p><p>");
  html = html.replace(/\n/g, "<br />");
  html = "<p>" + html + "</p>";
  html = html.replace(/<p>\s*<\/p>/g, "");
  html = html.replace(/<p>(<ul[^>]*>)/g, "$1");
  html = html.replace(/(<\/ul>)<\/p>/g, "$1");

  return html;
}

export function buildInternalLinks(content: BlogPostContent, currentSlug: string, allPosts: Map<string, BlogPostMeta>): string {
  const linkMap = new Map<string, { slug: string; title: string }>();

  allPosts.forEach((post, slug) => {
    if (slug === currentSlug) return;

    const body = post.content.intro + post.content.sections.map(s => s.body).join("");
    const titleWords = post.title.split(/[\s\u3000]+/);

    for (const word of titleWords) {
      if (word.length >= 2 && !linkMap.has(word)) {
        linkMap.set(word, { slug, title: post.title });
      }
    }
  });

  let html = content.intro + content.sections.map(s => s.body).join("\n\n");

  linkMap.forEach(({ slug, title }) => {
    const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp("(" + escapedTitle + ")", "g");
    html = html.replace(regex, '<a href="/blog/' + slug + '" class="internal-link text-blue-600 hover:underline font-medium" data-target-slug="' + slug + '">' + title + "</a>");
  });

  return html;
}
