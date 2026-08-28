// src/lib/schema.ts
// Re-export from seo/schema.ts for backward compatibility
export {
  generateFAQSchema,
  generateBreadcrumbSchema,
  generateSoftwareApplicationSchema,
  generateArticleSchema,
  getLocale,
  generateHrefLangTags,
} from './seo/schema';

export interface SchemaData {
  actors?: any[];
  applicationCategory?: string;
  availability?: string;
  bestRating?: string;
  dateModified?: string;
  datePublished?: string;
  description?: string;
  featureList?: string[];
  mainEntityOfPage?: any;
  name?: string;
  offers?: any;
  operatingSystem?: string;
  price?: number;
  priceCurrency?: string;
  ratingValue?: string;
  reviewCount?: string;
  worstRating?: string;
}

/**
 * Generate a complete JSON-LD schema object for a conversion page.
 * Combines BreadcrumbList, HowTo, SoftwareApplication, Article, FAQPage, and Review.
 */
export function generateSchema(
  sourceFormat: string,
  targetFormat: string,
  faqs?: Array<{ question: string; answer: string }>,
) {
  const baseUrl = 'https://www.bookconv.com';
  const slug = sourceFormat + '-to-' + targetFormat;
  const pageUrl = baseUrl + '/convert/' + slug;
  const sourceDisplay = sourceFormat.toUpperCase();
  const targetDisplay = targetFormat.toUpperCase();

  const breadcrumbs = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
    { '@type': 'ListItem', position: 2, name: 'Converters', item: baseUrl + '/convert' },
    { '@type': 'ListItem', position: 3, name: sourceDisplay + ' to ' + targetDisplay, item: pageUrl },
  ];

  const howToSteps = [
    { '@type': 'HowToStep', stepNumber: 1, name: 'Upload your file', text: 'Drag and drop your ' + sourceDisplay + ' file or click to browse.' },
    { '@type': 'HowToStep', stepNumber: 2, name: 'Conversion starts automatically', text: 'Our Calibre-powered engine converts your file in seconds.' },
    { '@type': 'HowToStep', stepNumber: 3, name: 'Download result', text: 'Once complete, download your converted ' + targetDisplay + ' file instantly.' },
  ];

  const graph: unknown[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'How to Convert ' + sourceDisplay + ' to ' + targetDisplay + ' Online',
      description: 'Follow these simple steps to convert ' + sourceDisplay + ' files to ' + targetDisplay + ' format online for free.',
      totalTime: 'PT2M',
      supply: [{ '@type': 'HowToSupply', name: sourceDisplay + ' file' }],
      tool: [{ '@type': 'HowToTool', name: 'Calibre' }],
      step: howToSteps,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Convert ' + sourceDisplay + ' to ' + targetDisplay + ' Online',
      description: sourceDisplay + ' to ' + targetDisplay + ' converter powered by Calibre. Free, no registration, no watermarks.',
      url: pageUrl,
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
      featureList: ['No registration required', 'No watermarks', 'Files auto-deleted within 1 hour', 'Batch conversion (Pro)', 'High-quality Calibre engine'],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'How to Convert ' + sourceDisplay + ' to ' + targetDisplay + ' Online — Free Guide',
      description: 'Free online ' + sourceDisplay + ' to ' + targetDisplay + ' converter guide with step-by-step instructions.',
      author: { '@type': 'Organization', name: 'BookConv', url: baseUrl },
      publisher: { '@type': 'Organization', name: 'BookConv', logo: { '@type': 'ImageObject', url: baseUrl + '/icon.svg' } },
      datePublished: '2026-07-26T00:00:00+00:00',
      dateModified: new Date().toISOString(),
      mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
      image: baseUrl + '/og-image.svg',
      wordCount: 1500,
      inLanguage: 'en',
    },
  ];

  if (faqs && faqs.length > 0) {
    const pageUrl = baseUrl + '/convert/' + slug;
    graph.push({
      '@type': 'FAQPage',
      author: { '@type': 'Organization', name: 'BookConv' },
      datePublished: '2026-07-26T00:00:00+00:00',
      url: pageUrl,
      mainEntity: faqs.map((f, i) => ({
        '@type': 'Question',
        name: f.question,
        answerCount: 1,
        author: { '@type': 'Organization', name: 'BookConv' },
        url: pageUrl + '#faq-' + (i + 1),
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.answer,
          datePublished: '2026-07-26T00:00:00+00:00',
          author: { '@type': 'Organization', name: 'BookConv' },
          url: pageUrl + '#faq-' + (i + 1),
        },
      })),
    });
  }

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2);
}
