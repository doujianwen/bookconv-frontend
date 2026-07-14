const fs = require('fs');
const dir = 'src/app';

// 1. Fix page.tsx: Split generateMetadata into a separate server file
// First, create src/app/metadata.ts as a server component-only file
let pageContent = fs.readFileSync(dir + '/page.tsx', 'utf8');

// Extract generateMetadata function
const genMetaMatch = pageContent.match(/(export async function generateMetadata\(\): Promise<Metadata> \{[\s\S]*?\n\})/);
if (genMetaMatch) {
  // Write metadata.ts
  const metadataImport = `import type { Metadata } from "next"\n`;
  fs.writeFileSync(dir + '/metadata.ts', metadataImport + genMetaMatch[1]);
  console.log('Created src/app/metadata.ts');
  
  // Remove generateMetadata from page.tsx and add import
  pageContent = pageContent.replace(genMetaMatch[1], 'import { generateMetadata } from "./metadata"');
  
  // Also remove the BOM "use client" and keep it
  pageContent = pageContent.replace(/^\uFEFF/, '');
  
  fs.writeFileSync(dir + '/page.tsx', pageContent);
  console.log('Fixed src/app/page.tsx');
} else {
  console.log('Could not find generateMetadata in page.tsx');
}

// 2. Fix blog/[slug]/page.tsx - double comma
let blogContent = fs.readFileSync(dir + '/blog/[slug]/page.tsx', 'utf8');
blogContent = blogContent.replace(/,\s*,\s*\)/g, ')');
fs.writeFileSync(dir + '/blog/[slug]/page.tsx', blogContent);
console.log('Fixed src/app/blog/[slug]/page.tsx');

// 3. Fix pricing/page.tsx - extra closing brace already done above
console.log('All fixes applied!');