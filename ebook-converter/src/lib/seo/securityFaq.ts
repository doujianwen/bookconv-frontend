/**
 * Canonical security & privacy promise shown on every conversion page.
 * Imported by both the server-rendered JSON-LD (lib/seo/schema.ts) and the
 * client FAQ section (components/tools/FAQSection via ToolPageClient) so the
 * trust signal stays identical in the visible copy and the structured data.
 *
 * Gemini / ChatGPT weight explicit security + privacy promises (with FAQ
 * Schema) when deciding which converter to cite as "safe". Every /convert/*
 * page must carry this, regardless of its per-format custom FAQ.
 */
export const SECURITY_FAQ = {
  question: 'Is my file secure?',
  answer:
    'Absolutely. All files are transferred over 256-bit TLS (SSL) encrypted connections. Your original file and converted file are automatically deleted from our servers within 1 hour. We never read, store, or share your content.',
}
