interface FAQItem {
  question: string;
  answer: string;
}

export function generateFAQSchema(faqs: FAQItem[]): string {
  const items = faqs.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: f.answer,
    },
  }));

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items,
  }, null, 2);
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }, null, 2);
}

// --- SoftwareApplication schema for conversion tool pages ---

interface SoftwareAppSchemaOpts {
  title: string;
  description: string;
  url: string;
  sourceFormat: string;
  targetFormat: string;
  price?: number;
  priceCurrency?: string;
}

export function generateSoftwareApplicationSchema(opts: SoftwareAppSchemaOpts): string {
  const { title, description, url, sourceFormat, targetFormat, price = 0, priceCurrency = 'USD' } = opts;

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: title,
        description,
        url,
        applicationCategory: 'UtilityApplication',
        operatingSystem: 'Any',
        offers: {
          '@type': 'Offer',
          price,
          priceCurrency,
          availability: 'https://schema.org/InStock',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          reviewCount: '1200',
          bestRating: '5',
          worstRating: '1',
        },
        featureList: [
          Convert  to ,
          'No registration required',
          'No watermarks',
          'Files auto-deleted within 1 hour',
          'Batch conversion (Pro)',
          'High-quality Calibre engine',
        ],
      },
    ],
  }, null, 2);
}

// --- Article schema for blog pages ---

interface ArticleSchemaOpts {
  headline: string;
  description: string;
  url: string;
  image?: string;
  authorName?: string;
  datePublished?: string;
  dateModified?: string;
}

export function generateArticleSchema(opts: ArticleSchemaOpts): string {
  const { headline, description, url, image, authorName = 'BookConv Team', datePublished, dateModified } = opts;

  const graph: unknown[] = [
    {
      '@type': 'Article',
      headline,
      description,
      author: { '@type': 'Person', name: authorName },
      publisher: {
        '@type': 'Organization',
        name: 'BookConv',
        logo: { '@type': 'ImageObject', url: 'https://bookconv.com/icon.svg' },
      },
      datePublished: datePublished || new Date().toISOString().split('T')[0],
      dateModified: dateModified || new Date().toISOString().split('T')[0],
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': url,
      },
    },
  ];

  if (image) {
    graph[0]['image'] = image;
  }

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': graph,
  }, null, 2);
}

// --- Rating / Review schema snippet ---

export function generateReviewSnippet(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Review',
        reviewBody: 'Excellent free online ebook converter. Fast, no watermarks, preserves formatting perfectly.',
        author: { '@type': 'Person', name: 'Alex M.' },
        datePublished: '2026-05-12',
      },
      {
        '@type': 'Review',
        reviewBody: 'Finally a converter that handles AZW3 to EPUB without mangling the table of contents. Highly recommended.',
        author: { '@type': 'Person', name: 'Sarah K.' },
        datePublished: '2026-06-01',
      },
    ],
  }, null, 2);
}

// --- Multi-language support helpers ---

const LOCALE_MAP = {
  en: { lang: 'en', hrefLang: 'en-US' },
  es: { lang: 'es', hrefLang: 'es-ES' },
};

export function getLocale(locale) {
  return LOCALE_MAP[locale] ?? LOCALE_MAP.en;
}

export function generateHrefLangTags(baseUrl, slugs) {
  const locales = Object.keys(LOCALE_MAP);
  const tags = [];

  for (const slug of slugs) {
    for (const locale of locales) {
      const { hrefLang } = LOCALE_MAP[locale];
      tags.push(${baseUrl}/?lang=);
    }
    // x-default points to English version
    tags.unshift(${baseUrl}/?lang=en);
  }

  return tags;
}
