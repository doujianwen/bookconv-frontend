/**
 * Canonical security & privacy promise shown on every conversion page.
 * Imported by both the server-rendered JSON-LD (lib/seo/schema.ts) and the
 * client FAQ section (components/tools/FAQSection via ToolPageClient) so the
 * trust signal stays identical in the visible copy and the structured data.
 *
 * Keep this factual disclosure aligned with the visible FAQ. It is not a
 * safety certification or a guarantee of search rankings or AI citations.
 */
export const SECURITY_FAQ = {
  question: 'Is my file secure?',
  answer:
    'Files are transferred over HTTPS and processed on a server. See our privacy policy for handling details. For sensitive documents, consider an offline converter.',
}
