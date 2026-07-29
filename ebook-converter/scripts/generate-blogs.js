// generate-blogs.js - Convert issue files to blog posts
// 修复说明（2026-07-30）：
//   1. sourceDir 由硬编码绝对路径改为相对路径（原 "E:\\一人公司\\..." 不可移植）
//   2. frontmatter date 由字符串字面量改为模板插值（原 new Date().toISOString() 不求值，写进 MDX 是非法日期）
const fs = require("fs");
const path = require("path");

// 修复：相对路径，文件位于 ebook-converter/scripts/，".."".." 回到仓库根
const sourceDir = path.join(__dirname, "..", "..");
const blogDir = path.join(sourceDir, "ebook-converter", "src", "app", "blog");

// Ensure blog directory exists
if (!fs.existsSync(blogDir)) {
  fs.mkdirSync(blogDir, { recursive: true });
}

// Get all issue files
const allFiles = fs.readdirSync(sourceDir);
const issueFiles = allFiles.filter(f => f.startsWith("issue_") && f.endsWith(".txt"));

console.log("Found " + issueFiles.length + " issue files to convert");

issueFiles.forEach(fileName => {
  const filePath = path.join(sourceDir, fileName);
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.trim().split("\n").filter(l => l.trim().length > 0);

    // Extract slug from filename (e.g., issue_p0_1_sitemap.txt -> "sitemap")
    const baseName = fileName.replace(".txt", "");
    const match = baseName.match(/issue_\w+\d+_(\w+)/);
    const slug = match ? match[1] : baseName;

    const titleMap = {
      "sitemap": "Sitemap Configuration for SEO",
      "worker": "Understanding Background Workers",
      "download": "Optimizing Ebook Downloads",
      "webhook": "Webhook Integration Guide",
      "batch-result": "Batch Processing Results",
      "middleware": "Middleware Architecture",
      "env": "Environment Variables Setup"
    };
    const displayTitle = titleMap[slug] ? titleMap[slug] : slug.charAt(0).toUpperCase() + slug.slice(1);

    // Create summary from first 5 lines
    const summaryLines = lines.slice(0, Math.min(5, lines.length));
    const summary = summaryLines.join("\n").substring(0, 250) + (lines.length > 5 ? "..." : "");

    // Generate MDX frontmatter + content
    // 修复：date 用 ${} 模板插值，使其被求值为真实 ISO 时间戳
    const mdx = "---\n" +
      "title: \"" + displayTitle + "\"\n" +
      "slug: " + slug + "\n" +
      "date: " + new Date().toISOString() + "\n" +
      "---\n\n" +
      "# " + displayTitle + "\n\n" +
      "This article covers the " + slug + " topic for the ebook format converter station.\n\n" +
      "## Overview\n\n" +
      summary + "\n\n" +
      "## Details\n\n" +
      "The original issue file contained " + lines.length + " lines of documentation. Key topics include:\n\n" +
      lines.slice(0, 6).map((l, i) => (i + 1) + ". " + l).join("\n") + "\n\n" +
      (lines.length > 6 ? "\n...(truncated)...\n\n" : "") +
      "---\n\n" +
      "*Generated automatically from issue file: " + fileName + "*\n";

    const outPath = path.join(blogDir, slug + ".mdx");
    fs.writeFileSync(outPath, mdx, "utf8");
    console.log("✓ Created: " + slug + ".mdx (" + lines.length + " lines)");

  } catch (e) {
    console.warn("⚠ Skipped " + fileName + ": " + e.message);
  }
});

console.log("\n=== Blog generation complete ===");
console.log("Blog pages saved to: " + blogDir);
